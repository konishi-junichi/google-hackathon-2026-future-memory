import os
from google.cloud import bigquery
from typing import List, Optional, Dict, Any
import uuid
import datetime
import logging
import json

logger = logging.getLogger(__name__)

class BigQueryService:
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.dataset_id = "future_memory_v1"
        self.client = bigquery.Client(project=self.project_id)
        self.location = "asia-northeast1"

    def _insert_rows_using_load_job(self, table_id: str, rows: List[Dict[str, Any]]):
        """
        Helper to insert rows using a load job instead of streaming.
        This avoids streaming buffer issues for immediate DML operations.
        """
        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
            schema_update_options=[
                bigquery.SchemaUpdateOption.ALLOW_FIELD_ADDITION,
                bigquery.SchemaUpdateOption.ALLOW_FIELD_RELAXATION
            ],
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
        )

        try:
            # load_table_from_json expects a list of dicts
            load_job = self.client.load_table_from_json(
                rows,
                table_id,
                job_config=job_config,
                location=self.location
            )
            load_job.result()  # Wait for the job to complete
            if load_job.errors:
                logger.error(f"Load job errors: {load_job.errors}")
                raise Exception(f"BigQuery load job failed: {load_job.errors}")
        except Exception as e:
            logger.error(f"Failed to execute load job: {e}")
            raise

    def _get_table_id(self, table_name: str) -> str:
        return f"{self.project_id}.{self.dataset_id}.{table_name}"

    def _map_step_to_bq(self, step: Dict[str, Any], day: int, order: int) -> Dict[str, Any]:
        """
        Helper to map a single itinerary step to BigQuery schema.
        """
        loc = step.get("location")
        geo_point = None
        if loc and isinstance(loc, dict) and "lng" in loc and "lat" in loc:
            # Create GeoJSON Point for BigQuery GEOGRAPHY type
            # Note: BigQuery insert_rows_json supports strict GeoJSON
            geo_point = f"POINT({loc['lng']} {loc['lat']})" 

        return {
            "step_order": order,
            "time": f"Day {day} {step.get('time', '')}", # Embed Day into time for now
            "spot_name": step.get("activity") or step.get("spot_name", "Unknown Spot"),
            "location": geo_point,
            "type": "visit", # Default type
            "note": step.get("description") or step.get("note", ""),
            "ref_video_url": step.get("ref_video_url", "")
        }

    async def share_plan(self, plan_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Inserts or updates a travel plan in BigQuery PlanShare table.
        Returns a dict with 'plan_id', 'status' (created, updated, duplicate), and 'message'.
        """
        table_id = self._get_table_id("PlanShare")
        
        input_plan_id = plan_data.get("plan_id")
        title = plan_data.get("title")
        target_plan_id = None
        
        # 1. Check for Update (if plan_id provided)
        if input_plan_id:
            # Verify ownership
            check_sql = f"SELECT 1 FROM `{table_id}` WHERE plan_id = @id AND creator_user_id = @uid"
            check_job = self.client.query(check_sql, job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", input_plan_id),
                    bigquery.ScalarQueryParameter("uid", "STRING", user_id)
                ]
            ))
            if next(iter(check_job), None):
                target_plan_id = input_plan_id
            else:
                 # ID provided but not found or not owned.
                 # Fallback to Title check below.
                 pass

        if not target_plan_id:
            # Check for existing plan by Title
            # User wants to overwrite if title matches (prevent duplicates)
            target_plan_id = await self.check_duplicate_plan(user_id, title)
            
        if target_plan_id:
            # Update existing plan: Delete then Insert
            delete_sql = f"DELETE FROM `{table_id}` WHERE plan_id = @id"
            self.client.query(delete_sql, job_config=bigquery.QueryJobConfig(
                query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", target_plan_id)]
            )).result()
            
            plan_id = target_plan_id
            status = "updated"
            message = "Plan updated successfully"
        else:
            # Create NEW
            plan_id = str(uuid.uuid4())
            status = "created"
            message = "Plan shared successfully"

        created_at = datetime.datetime.now(datetime.timezone.utc)
        
        # Transform itinerary to match BigQuery schema
        raw_itinerary = plan_data.get("itinerary", [])
        bq_itinerary = []
        step_counter = 1

        for item in raw_itinerary:
            # Handle nested Day structure (frontend usually sends this)
            if isinstance(item, dict) and "days" in item: 
                 # In case it's the full ItineraryResponse object
                 days_list = item.get("days", [])
                 for day_data in days_list:
                    day_num = day_data.get("day", 1)
                    for step in day_data.get("items", []):
                        bq_itinerary.append(self._map_step_to_bq(step, day_num, step_counter))
                        step_counter += 1
            elif isinstance(item, dict) and "day" in item and "items" in item:
                # List of ItineraryDay objects
                day_num = item.get("day", 1)
                for step in item.get("items", []):
                    bq_itinerary.append(self._map_step_to_bq(step, day_num, step_counter))
                    step_counter += 1
            else:
                # Fallback or already flat (try to map what we can)
                # If it looks like a step, just add it with defaults
                bq_itinerary.append(self._map_step_to_bq(item, 1, step_counter))
                step_counter += 1

        # Embed Souvenirs as a hidden step
        souvenirs = plan_data.get("souvenirs", [])
        if souvenirs:
            # We convert pydantic models to dict if needed, or assume they are dicts
            souvenirs_data = [s.dict() if hasattr(s, 'dict') else s for s in souvenirs]
            bq_itinerary.append({
                "step_order": 9999, # Push to end
                "time": "dataset",
                "spot_name": "Souvenir Data",
                "location": None,
                "type": "souvenir_dataset",
                "note": json.dumps(souvenirs_data),
                "ref_video_url": ""
            })

        row = {
            "plan_id": plan_id,
            "creator_user_id": user_id,
            "title": plan_data.get("title"),
            "description": plan_data.get("description"),
            "thumbnail_url": plan_data.get("thumbnail"),
            "total_duration_minutes": plan_data.get("total_duration_minutes", 0),
            "tags": plan_data.get("tags", []),
            "target_mode": plan_data.get("target_mode"),
            "like_count": plan_data.get("like_count", 0), # Preserve if updating? Or reset?
            # Actually for update we might want to preserve like_count if we fetched it.
            # But here we are overwriting. 
            # In a real app we would read old like_count. 
            # For hackathon simplicity, reset or ignore (since likes are in UserLikes table mostly for counting unique likes, but checking count logic...)
            # The count in PlanShare is denormalized. 
            # We should probably fetch it if updating. 
            "created_at": created_at.isoformat(),
            "itinerary": bq_itinerary
        }
        
        # If updating, try to preserve created_at and like_count if possible?
        # For now, simplistic overwrite. Created_at becomes updated_at effectively.

        try:
            self._insert_rows_using_load_job(table_id, [row])
        except Exception as e:
            logger.error(f"Failed to insert plan: {e}")
            raise Exception(f"BigQuery insert failed: {e}")
        
        logger.info(f"Inserted/Updated plan {plan_id} into BigQuery with status {status}")
        return {"plan_id": plan_id, "status": status, "message": message}

    async def search_plans(self, query: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Searches plans in BigQuery.
        For now, uses simple string matching on title/description/tags.
        """

        table_id = self._get_table_id("PlanShare")
        
        sql = f"""
            SELECT plan_id, title, description, thumbnail_url, tags, creator_user_id, like_count, created_at
            FROM `{table_id}`
        """
        
        params = []
        if query:
            # Simple keyword search
            # Note: This is vulnerable to injection if not parameterized properly, but BQ params handle it.
            # However, for simple LIKE logic:
            sql += """
                WHERE title LIKE @query 
                OR description LIKE @query 
                OR EXISTS(SELECT * FROM UNNEST(tags) AS t WHERE t LIKE @query)
            """
            params.append(bigquery.ScalarQueryParameter("query", "STRING", f"%{query}%"))
        
        sql += " ORDER BY created_at DESC LIMIT @limit"
        params.append(bigquery.ScalarQueryParameter("limit", "INT64", limit))

        job_config = bigquery.QueryJobConfig(query_parameters=params)
        query_job = self.client.query(sql, job_config=job_config)
        
        results = []
        for row in query_job:
            results.append({
                "plan_id": row.plan_id,
                "title": row.title,
                "description": row.description,
                "thumbnail": row.thumbnail_url,
                "tags": row.tags,
                "author": row.creator_user_id, # In real app, join with Users table or resolve name
                "like_count": row.like_count,
                "created_at": row.created_at,
                "match_reason": "Keyword match" # Placeholder
            })
            
        return results

    async def get_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single plan by ID.
        Checks PlanShare first, then PlanFavorites if not found.
        """

        # 1. Try PlanShare
        table_share = self._get_table_id("PlanShare")
        sql_share = f"SELECT * FROM `{table_share}` WHERE plan_id = @id"
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", plan_id)]
        )
        query_job = self.client.query(sql_share, job_config=job_config)
        row = next(iter(query_job), None)

        # 2. Try PlanFavorites if not found
        if not row:
            table_favs = self._get_table_id("PlanFavorites")
            sql_favs = f"SELECT * FROM `{table_favs}` WHERE favorite_id = @id"
            query_job = self.client.query(sql_favs, job_config=job_config)
            row = next(iter(query_job), None)
            
        if not row:
            return None
            
        itinerary_items = [dict(step) for step in row.itinerary] if row.itinerary else []
        souvenirs = []
        
        # Extract hidden souvenir data
        clean_itinerary = []
        for item in itinerary_items:
            if item.get("type") == "souvenir_dataset":
                try:
                    souvenirs = json.loads(item.get("note", "[]"))
                except:
                    pass
            else:
                clean_itinerary.append(item)

        # Normalize field names (favorite_id vs plan_id, creator_user_id vs user_id)
        # PlanShare has plan_id, creator_user_id
        # PlanFavorites has favorite_id, user_id (and optional plan_id which refers to original)
        row_dict = dict(row)
        
        # If favorite_id is in the row, we use it as the primary plan_id for the response
        # to maintain consistency with how get_favorites returns it.
        final_id = row_dict.get("favorite_id") or row_dict.get("plan_id")
        author_id = row_dict.get("creator_user_id") or row_dict.get("user_id") or "Unknown"

        return {
            "plan_id": final_id,
            "title": row_dict.get("title"),
            "description": row_dict.get("description"),
            "thumbnail": row_dict.get("thumbnail_url"),
            "tags": row_dict.get("tags", []),
            "author": author_id,
            "like_count": row_dict.get("like_count", 0),
            "created_at": row_dict.get("created_at"),
            "itinerary": clean_itinerary,
            "souvenirs": souvenirs
        }

    async def check_duplicate_plan(self, user_id: str, title: str) -> Optional[str]:
        """
        Checks if a plan with the same title already exists for the user.
        Returns plan_id if found, None otherwise.
        """

        table_id = self._get_table_id("PlanShare")
        
        sql = f"""
            SELECT plan_id
            FROM `{table_id}`
            WHERE creator_user_id = @user_id AND title = @title
            LIMIT 1
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("title", "STRING", title)
            ]
        )
        
        query_job = self.client.query(sql, job_config=job_config)
        row = next(iter(query_job), None)
        
        if row:
            return row.plan_id
        return None

    async def add_like(self, plan_id: str, user_id: str) -> bool:
        """
        Adds a like to a plan. Returns True if successful.
        Checks for duplicates in UserLikes.
        """
        likes_table = self._get_table_id("UserLikes")
        plans_table = self._get_table_id("PlanShare")
        
        # Check if already liked
        check_sql = f"""
            SELECT 1 FROM `{likes_table}`
            WHERE user_id = @user_id AND plan_id = @plan_id
        """
        check_job = self.client.query(check_sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("plan_id", "STRING", plan_id)
            ]
        ))
        if next(iter(check_job), None):
            return False # Already liked
            
        # Insert like
        like_id = str(uuid.uuid4())
        created_at = datetime.datetime.now(datetime.timezone.utc)
        row = {
            "like_id": like_id,
            "user_id": user_id,
            "plan_id": plan_id,
            "created_at": created_at.isoformat()
        }
        errors = self.client.insert_rows_json(likes_table, [row])
        if errors:
            logger.error(f"Failed to insert like: {errors}")
            return False
            
        # Update plan count (Best effort, ideally perform in transaction or periodic aggregate)
        # For simplicity, we just run an update query
        update_sql = f"""
            UPDATE `{plans_table}`
            SET like_count = like_count + 1
            WHERE plan_id = @plan_id
        """
        self.client.query(update_sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("plan_id", "STRING", plan_id)]
        ))
        
        return True

    async def save_plan_to_favorites(self, plan_data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Saves a plan snapshot to PlanFavorites.
        Handles Create, Update, and Duplicate detection.
        """
        fav_table = self._get_table_id("PlanFavorites")
        title = plan_data.get("title")
        
        # Use existing plan_id (mapped to favorite_id in frontend) if available
        # The frontend calls `addToFavorites` with a `SharePlanRequest` structure which has an optional `plan_id`.
        # However, `plan_id` in frontend usually refers to the ID in `PlanShare` or `PlanFavorites`.
        # When editing a favorite, frontend should ideally send the `plan_id` (which is `favorite_id` in DB).
        
        input_id = plan_data.get("plan_id")
        
        # 1. Check for Update
        target_fav_id = None
        
        # 1. Check for Update (by ID)
        if input_id:
            # Check ownership
            check_sql = f"SELECT favorite_id FROM `{fav_table}` WHERE favorite_id = @id AND user_id = @uid"
            check_job = self.client.query(check_sql, job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", input_id),
                    bigquery.ScalarQueryParameter("uid", "STRING", user_id)
                ]
            ))
            row = next(iter(check_job), None)
            if row:
                target_fav_id = row.favorite_id
        
        if not target_fav_id:
            # 2. Check for Update (by Title)
            # User wants to overwrite duplicate titles in My List too
            check_sql = f"SELECT favorite_id FROM `{fav_table}` WHERE user_id = @uid AND title = @title"
            check_job = self.client.query(check_sql, job_config=bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("uid", "STRING", user_id),
                    bigquery.ScalarQueryParameter("title", "STRING", title)
                ]
            ))
            row = next(iter(check_job), None)
            if row:
                target_fav_id = row.favorite_id

        if target_fav_id:
            # Update: Delete + Insert
            delete_sql = f"DELETE FROM `{fav_table}` WHERE favorite_id = @id"
            self.client.query(delete_sql, job_config=bigquery.QueryJobConfig(
                query_parameters=[bigquery.ScalarQueryParameter("id", "STRING", target_fav_id)]
            )).result()
            
            fav_id = target_fav_id
            status = "updated"
            message = "Favorite updated successfully"
        else:
            # Create NEW
            fav_id = str(uuid.uuid4())
            status = "created"
            message = "Added to favorites"

        created_at = datetime.datetime.now(datetime.timezone.utc)
        
        # Prepare itinerary
        raw_itinerary = plan_data.get("itinerary", [])
        bq_itinerary = []
        step_counter = 1
        for item in raw_itinerary:
            if isinstance(item, dict) and "days" in item: 
                 days_list = item.get("days", [])
                 for day_data in days_list:
                    day_num = day_data.get("day", 1)
                    for step in day_data.get("items", []):
                        bq_itinerary.append(self._map_step_to_bq(step, day_num, step_counter))
                        step_counter += 1
            elif isinstance(item, dict) and "day" in item and "items" in item:
                # ItineraryDay structure
                day_num = item.get("day", 1)
                for step in item.get("items", []):
                    bq_itinerary.append(self._map_step_to_bq(step, day_num, step_counter))
                    step_counter += 1
            else:
                bq_itinerary.append(self._map_step_to_bq(item, 1, step_counter))
                step_counter += 1

        # Souvenirs
        souvenirs = plan_data.get("souvenirs", [])
        if souvenirs:
            souvenirs_data = [s.dict() if hasattr(s, 'dict') else s for s in souvenirs]
            bq_itinerary.append({
                "step_order": 9999,
                "time": "dataset",
                "spot_name": "Souvenir Data",
                "location": None,
                "type": "souvenir_dataset",
                "note": json.dumps(souvenirs_data),
                "ref_video_url": ""
            })

        row = {
            "favorite_id": fav_id,
            "user_id": user_id,
            "plan_id": plan_data.get("plan_id") if status == "updated" else None, # Keep ref if updating or undefined
            # Actually if we are saving a shared plan, we should keep the shared plan ID as reference?
            # Current schema has `plan_id` in Favorites.
            # If `status` is created, `input_id` might be the shared plan ID.
            # Let's try to store input_id as plan_id ref if it's created.
            "title": title,
            "description": plan_data.get("description"),
            "thumbnail_url": plan_data.get("thumbnail"),
            "tags": plan_data.get("tags", []),
            "created_at": created_at.isoformat(),
            "itinerary": bq_itinerary
        }
        
        # Fix: If status is created, input_id might be the shared plan ID we are saving.
        if status == "created" and input_id:
             row["plan_id"] = input_id
        
        try:
            self._insert_rows_using_load_job(fav_table, [row])
            return {"plan_id": fav_id, "status": status, "message": message}
        except Exception as e:
            logger.error(f"Failed to insert favorite: {e}")
            raise Exception(f"BigQuery insert failed: {e}")

    async def get_favorites(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Gets a user's favorite plans from PlanFavorites.
        """
        fav_table = self._get_table_id("PlanFavorites")
        
        sql = f"""
            SELECT favorite_id as plan_id, title, description, thumbnail_url, tags, user_id as creator_user_id, 0 as like_count, itinerary, created_at
            FROM `{fav_table}`
            WHERE user_id = @user_id
            ORDER BY created_at DESC
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("user_id", "STRING", user_id)]
        )
        query_job = self.client.query(sql, job_config=job_config)
        
        results = []
        for row in query_job:
            # Extract souvenirs if present
            itinerary_items = [dict(step) for step in row.itinerary] if row.itinerary else []
            souvenirs = []
            for item in itinerary_items:
                if item.get("type") == "souvenir_dataset":
                    try:
                        souvenirs = json.loads(item.get("note", "[]"))
                    except:
                        pass
            
            results.append({
                "plan_id": row.plan_id, # This is actually favorite_id which acts as plan_id for display
                "title": row.title,
                "description": row.description,
                "thumbnail": row.thumbnail_url,
                "tags": row.tags,
                "author": row.creator_user_id,
                "like_count": row.like_count,
                "match_reason": "Saved",
                "souvenirs": souvenirs,
                "created_at": row.created_at
            })
        return results

    async def get_user_shared_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Gets plans shared by a specific user from PlanShare.
        """
        table_id = self._get_table_id("PlanShare")
        
        sql = f"""
            SELECT plan_id, title, description, thumbnail_url, tags, creator_user_id, like_count, created_at
            FROM `{table_id}`
            WHERE creator_user_id = @user_id
            ORDER BY created_at DESC
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("user_id", "STRING", user_id)]
        )
        query_job = self.client.query(sql, job_config=job_config)
        
        results = []
        for row in query_job:
            results.append({
                "plan_id": row.plan_id,
                "title": row.title,
                "description": row.description,
                "thumbnail": row.thumbnail_url,
                "tags": row.tags,
                "author": row.creator_user_id,
                "like_count": row.like_count,
                "created_at": row.created_at
            })
        return results

    async def delete_favorite(self, fav_id: str, user_id: str) -> bool:
        """
        Deletes a plan snapshot from PlanFavorites.
        """
        table_id = self._get_table_id("PlanFavorites")
        sql = f"DELETE FROM `{table_id}` WHERE favorite_id = @fav_id AND user_id = @user_id"
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("fav_id", "STRING", fav_id),
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id)
            ]
        )
        try:
            query_job = self.client.query(sql, job_config=job_config)
            query_job.result()
            return True
        except Exception as e:
            logger.error(f"Failed to delete favorite: {e}")
            return False

    async def delete_shared_plan(self, plan_id: str, user_id: str) -> bool:
        """
        Deletes a shared plan from PlanShare.
        """
        table_id = self._get_table_id("PlanShare")
        sql = f"DELETE FROM `{table_id}` WHERE plan_id = @plan_id AND creator_user_id = @user_id"
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("plan_id", "STRING", plan_id),
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id)
            ]
        )
        try:
            query_job = self.client.query(sql, job_config=job_config)
            query_job.result()
            return True
        except Exception as e:
            logger.error(f"Failed to delete shared plan: {e}")
            return False
