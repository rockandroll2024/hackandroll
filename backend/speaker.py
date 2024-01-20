import os
import openai
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()

openai.api_key = os.getenv("GPT_API_KEY")

class Speaker:
    def __init__(self):
        pass

    def generateAudio(self, text):
        speech_file_path = Path(__file__).parent / "../output_audio/output.mp3"

        response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )

        response.stream_to_file(speech_file_path)

        file = "../output_audio/output.mp3"
        print('playing sound using native player')
        os.system("afplay " + file)

if __name__ == "__main__":
    speaker = Speaker()
    speaker.generateAudio("ohiousy skibidi rizzlet ice spice level 10 gyatt ryan gosling sigma boss baby kai cenat W rizz what the dog doing baby gronk livy dunn am I a simp for mewing to looksmaxx or is edging goated welcome back to my channel this is markiplier L rizz")

