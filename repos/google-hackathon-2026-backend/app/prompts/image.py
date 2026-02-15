def get_image_generation_prompt(location: str) -> str:
    return f"""
    Please generate a high-definition, photorealistic image of {location}.
    The image should be vibrant, inviting, and capture the essence of the location.
    It should look like a professional travel photograph.
    Do not include any text in the image.
    Aspcect ratio should be 4:3.
    """
