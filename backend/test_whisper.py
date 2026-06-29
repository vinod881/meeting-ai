import os
import urllib.request
from faster_whisper import WhisperModel

def download_test_audio(url, filename):
    if not os.path.exists(filename):
        print(f"Downloading test audio from {url}...")
        urllib.request.urlretrieve(url, filename)
        print("Download complete.")
    else:
        print(f"Using existing test audio: {filename}")

def transcribe_audio():
    # URL for a standard 3-second spoken speech clip (JFK's inaugural address)
    audio_url = "https://raw.githubusercontent.com/ggerganov/whisper.cpp/master/samples/jfk.wav"
    audio_file = "jfk.wav"
    
    # Ensure audio file exists
    download_test_audio(audio_url, audio_file)
    
    # Model size: 'base' (approx 140MB) or 'tiny' (approx 75MB)
    model_size = "base"
    print(f"Loading Whisper model '{model_size}' (runs entirely offline)...")
    
    # Load model on CPU with int8 quantization for fast CPU execution
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    print("Transcribing audio...")
    segments, info = model.transcribe(audio_file, beam_size=5)
    
    print("-" * 50)
    print(f"Detected language: '{info.language}' with probability {info.language_probability:.2f}")
    print("-" * 50)
    
    for segment in segments:
        print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
    print("-" * 50)
    print("Transcription finished successfully!")

if __name__ == "__main__":
    transcribe_audio()
