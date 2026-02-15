import os
import logging
import json
import traceback
import uuid
from typing import List, Dict, Any

from google.genai import types
from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from app.prompts.proposal import get_proposal_agent_instruction
from app.prompts.itinerary import get_itinerary_agent_instruction
from app.prompts.brushup import get_brushup_agent_instruction

logger = logging.getLogger(__name__)

class PlanDesignService:
    def __init__(self):
        project_id = os.getenv("GCP_PROJECT_ID")
        self.use_mock = os.getenv("USE_MOCK_AGENT", "false").lower() == "true"
        self.is_initialized = bool(project_id)
        if not self.is_initialized and not self.use_mock:
             logger.warning("GCP_PROJECT_ID not found. PlanDesignService running in mock mode.")
        
        # Ensure Vertex AI SDK uses the correct region
        vertex_location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        if os.getenv("GOOGLE_CLOUD_REGION") != vertex_location:
            os.environ["GOOGLE_CLOUD_REGION"] = vertex_location
            logger.info(f"Setting GOOGLE_CLOUD_REGION to {vertex_location} for Vertex AI")
        
        self.session_service = InMemorySessionService()
        self.app_name = "travel_designer_backend"

    async def _run_agent(self, agent_name: str, instruction: str, user_input: str) -> str:
        """
        Helper to run an adk Agent with the standard Runner pattern.
        """
        # 1. Define Agent
        agent = LlmAgent(
            model="gemini-3-flash-preview", 
            name=agent_name,
            instruction=instruction
        )

        # 2. Create Session
        user_id = f"user_{agent_name}"
        session_id = str(uuid.uuid4())
        
        session = await self.session_service.create_session(
            state={}, 
            app_name=self.app_name, 
            user_id=user_id,
            session_id=session_id
        )

        # 3. Create Content
        content = types.Content(role='user', parts=[types.Part(text=user_input)])

        # 4. Setup Runner
        runner = Runner(
            app_name=self.app_name,
            agent=agent,
            session_service=self.session_service,
        )

        # 5. Run
        logger.info(f"Running agent: {agent_name} (Session: {session_id})")
        events_async = runner.run_async(
            session_id=session_id, user_id=user_id, new_message=content
        )

        final_response_text = ""
        async for event in events_async:
            if event.is_final_response():
                if event.content and event.content.parts:
                    for result in event.content.parts:
                        final_response_text += result.text
                elif event.actions and event.actions.escalate:
                    logger.error(f"Agent escalated: {event.error_message}")
                break

        return final_response_text

    async def generate_proposals(self, mode: str, language: str, selected_tags: List[str] = None, custom_attributes: str = None, nights: int = 1, departure_location: str = None) -> List[Dict[str, Any]]:
        logger.info(f"Generating proposals for mode: {mode}, tags: {selected_tags}, language: {language}, nights: {nights}, departure: {departure_location}")
        
        if self.use_mock or not self.is_initialized:
            return self._get_mock_proposals(language, mode)

        instruction = get_proposal_agent_instruction(mode, language, selected_tags, custom_attributes, nights, departure_location)
        user_input = f"Generate 3 proposals now for mode: {mode}."

        try:
            text = await self._run_agent("proposal_designer", instruction, user_input)
            clean_text = text.replace('```json', '').replace('```', '').strip()
            result = json.loads(clean_text)
            logger.info(f"Successfully generated {len(result)} proposals.")
            return result
        except Exception as e:
            logger.error(f"PlanDesignService Agent Error (Proposals): {e}")
            logger.error(traceback.format_exc())
            return self._get_mock_proposals(language, mode)

    async def generate_itinerary(self, proposal_id: int, title: str, language: str, nights: int = 1) -> Dict[str, Any]:
        logger.info(f"Generating itinerary for proposal {proposal_id}: {title}, Nights: {nights}")
        
        if self.use_mock or not self.is_initialized:
            return self._get_mock_itinerary(language, proposal_id)

        instruction = get_itinerary_agent_instruction(proposal_id, title, language, nights)
        user_input = f"Create itinerary for '{title}'."

        try:
            text = await self._run_agent("itinerary_planner", instruction, user_input)
            clean_text = text.replace('```json', '').replace('```', '').strip()
            result = json.loads(clean_text)
            logger.info(f"Successfully generated itinerary for proposal {proposal_id}.")
            return result
        except Exception as e:
            logger.error(f"PlanDesignService Agent Error (Itinerary): {e}")
            logger.error(traceback.format_exc())
            return self._get_mock_itinerary(language, proposal_id)

    async def brush_up_itinerary(self, current_itinerary: Dict[str, Any], request: str, history: List[str]) -> Dict[str, Any]:
        logger.info(f"Brushing up itinerary with request: {request}")
        
        if self.use_mock or not self.is_initialized:
            logger.warning("Mock mode: returning original itinerary without changes.")
            return current_itinerary

        instruction = get_brushup_agent_instruction(current_itinerary, request, history)
        user_input = f"Brush up the plan based on my request: {request}"

        try:
            text = await self._run_agent("itinerary_concierge", instruction, user_input)
            clean_text = text.replace('```json', '').replace('```', '').strip()
            result = json.loads(clean_text)
            logger.info("Successfully brushed up itinerary.")
            return result
        except Exception as e:
            logger.error(f"PlanDesignService Agent Error (Brush Up): {e}")
            logger.error(traceback.format_exc())
            return current_itinerary

    def _get_mock_proposals(self, language, mode):
        # Realistic Mock Data
        if language == 'ja':
            return [
                {"id": 1, "title": "秋月：筑前の小京都", "tagline": "静寂の中に歴史を感じる散策", "desc": "時が止まったような城下町で、静かな思索にふける。歴史好きのための心安らぐ旅。", "match": 98, "color": "from-orange-400 to-pink-500", "location": "福岡県朝倉市秋月"},
                {"id": 2, "title": "太宰府：祈りの道", "tagline": "いにしえの歌人の囁き", "desc": "天満宮の神聖な空気と禅寺の静寂。心を整えるスピリチュアルな一日。", "match": 92, "color": "from-purple-400 to-indigo-500", "location": "太宰府天満宮"},
                {"id": 3, "title": "柳川：水郷めぐり", "tagline": "川面を渡る風と共に", "desc": "どんこ舟に揺られ、季節の花々と名物うなぎ料理を堪能する優雅な時間。", "match": 88, "color": "from-blue-400 to-teal-500", "location": "福岡県柳川市"}
            ]
        return [
             {"id": 1, "title": "Akizuki: Little Kyoto", "tagline": "Silence of History", "desc": "A castle town where time stands still.", "match": 98, "color": "from-orange-400 to-pink-500", "location": "Akizuki, Fukuoka"},
             {"id": 2, "title": "Dazaifu: Path of Prayer", "tagline": "Ancient Whispers", "desc": "Spiritual journey at Tenmangu.", "match": 92, "color": "from-purple-400 to-indigo-500", "location": "Dazaifu Tenmangu"},
             {"id": 3, "title": "Yanagawa: Water City", "tagline": "River Breeze", "desc": "Relaxing boat ride and unagi cuisine.", "match": 88, "color": "from-blue-400 to-teal-500", "location": "Yanagawa, Fukuoka"}
        ]

    def _get_mock_itinerary(self, language, proposal_id):
        if language == 'ja':
            return {
                "proposalId": proposal_id,
                "days": [
                    {
                        "day": 1,
                        "items": [
                            { 
                                "time": "10:00", 
                                "activity": "大徳寺で坐禅体験", 
                                "icon": "🏯",
                                "location": {"lat": 35.044, "lng": 135.746},
                                "description": "初心者でも安心の指導付きで、静寂の中で心を整えます。",
                                "travel_time": None
                            },
                            { 
                                "time": "12:00", 
                                "activity": "精進料理ランチ", 
                                "icon": "🍱",
                                "location": {"lat": 35.043, "lng": 135.745},
                                "description": "季節の野菜を使った伝統的な精進料理を堪能。",
                                "travel_time": "徒歩10分"
                            },
                            { 
                                "time": "14:00", 
                                "activity": "今宮神社で名物あぶり餅", 
                                "icon": "🍵",
                                "location": {"lat": 35.045, "lng": 135.743},
                                "description": "厄除けのご利益がある神社と、参道の名物お菓子。",
                                "travel_time": "徒歩15分"
                            },
                            { 
                                "time": "16:00", 
                                "activity": "鴨川デルタで夕涼み", 
                                "icon": "🌄",
                                "location": {"lat": 35.030, "lng": 135.772},
                                "description": "地元の人に愛される憩いの場。",
                                "travel_time": "徒歩10分"
                            }
                        ]
                    },
                    {
                        "day": 2,
                        "items": [
                            { 
                                "time": "09:00", 
                                "activity": "清水寺参拝", 
                                "icon": "⛩️",
                                "location": { "lat": 34.994, "lng": 135.784 },
                                "description": "朝一番の清水の舞台からの絶景。",
                                "travel_time": "バス30分"
                            },
                            { 
                                "time": "11:30", 
                                "activity": "二年坂・三年坂散策", 
                                "icon": "🚶",
                                "location": { "lat": 34.997, "lng": 135.782 },
                                "description": "風情ある石畳の道を散策。",
                                "travel_time": "徒歩10分"
                            },
                             { 
                                "time": "13:00", 
                                "activity": "八坂神社", 
                                "icon": "🏮",
                                "location": { "lat": 35.003, "lng": 135.778 },
                                "description": "祇園のシンボルを参拝。",
                                "travel_time": "徒歩15分"
                            }
                        ]
                    }
                ],
                "souvenirs": [
                    { "name": "京菓子", "price": "¥1,200" },
                    { "name": "西陣織ポーチ", "price": "¥3,500" }
                ]
            }
        return {
            "proposalId": proposal_id,
            "days": [
                {
                    "day": 1,
                    "items": [
                        { "time": "10:00", "activity": "Arrival", "icon": "🏯", "travel_time": "1h flight" },
                        { "time": "12:00", "activity": "Lunch", "icon": "🍱", "travel_time": "10m walk" },
                        { "time": "14:00", "activity": "Activity", "icon": "🍵", "travel_time": "20m bus" },
                        { "time": "16:00", "activity": "Shopping", "icon": "🎁", "travel_time": "5m walk" }
                    ]
                }
            ],
            "souvenirs": [
                { "name": "Local Sweet", "price": "¥1,200" },
                { "name": "Craft", "price": "¥3,500" }
            ]
        }
