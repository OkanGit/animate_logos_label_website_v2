# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from public.resources.postprocessing import animate_logo
import urllib

initialize_app()


@https_fn.on_request()
def on_request_example(req: https_fn.Request) -> https_fn.Response:
    url = ""
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0')]
    urllib.request.install_opener(opener)
    content = urllib.request.urlopen(url).read().decode('UTF-8')
    with open('logo.svg', 'w') as file:
        file.write(content)
    return https_fn.Response("Hello world!")
