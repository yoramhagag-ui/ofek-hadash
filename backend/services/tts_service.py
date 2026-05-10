import edge_tts
import tempfile

VOICE_MAP = {
    "hila": "he-IL-HilaNeural",
    "avri": "he-IL-AvriNeural",
}
DEFAULT_VOICE = "he-IL-HilaNeural"


async def speak(text: str, voice_name: str = "hila") -> str:
    """
    מקבל טקסט, מחזיר נתיב לקובץ MP3 זמני.
    המתקשר אחראי למחוק את הקובץ אחרי השימוש.
    """
    voice = VOICE_MAP.get(voice_name, DEFAULT_VOICE)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
        output_path = f.name

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    return output_path
