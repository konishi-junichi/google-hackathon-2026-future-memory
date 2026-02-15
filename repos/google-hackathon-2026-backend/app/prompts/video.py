def get_video_generation_prompt(destination: str, description: str, has_user_image: bool, has_destination_image: bool) -> str:
    if has_user_image:
        return f"""動画生成プロンプト:
この人物が、以下の旅行先で楽しく旅行している様子を動画にしてください。
人物のキャラクター性を維持しつつ、背景をその場所に馴染ませてください。
【旅行先】: {destination}
【詳細】: {description}"""
    elif has_destination_image:
        return f"""動画生成プロンプト:
この場所の美しい風景動画を生成してください。
視聴者が旅行に行きたくなるような、魅力的で臨場感のある映像にしてください。
【旅行先】: {destination}
【詳細】: {description}"""
    else:
        return f"""動画生成プロンプト:
以下の旅行先の魅力的な風景動画を生成してください。
【旅行先】: {destination}
【詳細】: {description}"""
