import joblib
from textblob import TextBlob
import re, nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

model = joblib.load("optimized_complaint_classifier.pkl")

def clean_text(text):
    text = re.sub(r'[^a-zA-Z ]', '', text.lower())
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return ' '.join(words)

def classify_and_score(text):
    cleaned = clean_text(text)
    category = model.predict([cleaned])[0]

    polarity = TextBlob(text).sentiment.polarity
    score = round((1 - polarity) * 5, 2)
    if score >= 8:
        level = "Low"
    elif score >= 5:
        level = "Medium"
    else:
        level = "High"

    return {
        "department": category,
        "priority_score": score,
        "priority_level": level
    }
