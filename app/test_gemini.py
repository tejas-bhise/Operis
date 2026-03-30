from dotenv import load_dotenv
load_dotenv()

from google import genai

client = genai.Client()

response = client.models.generate_content(

    model="gemini-2.0-flash",

    contents="Reply only working"

)

print(response.text)