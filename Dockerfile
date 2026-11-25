FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic loads settings, so give it a throwaway key just for this step
RUN SECRET_KEY=build-only-not-used-at-runtime python manage.py collectstatic --no-input

EXPOSE 10000

CMD ["sh", "-c", "python manage.py migrate && python manage.py initadmin && gunicorn piki_ora.wsgi:application --bind 0.0.0.0:${PORT:-10000}"]
