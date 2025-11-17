# This file was created to run the application on heroku using gunicorn.
# Read more about it here: https://devcenter.heroku.com/articles/python-gunicorn

from app import app as application

# Export as both 'app' and 'application' for compatibility
app = application

if __name__ == "__main__":
    application.run()
