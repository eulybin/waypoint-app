from flask import request, jsonify
from datetime import datetime
import os
import smtplib
from email.message import EmailMessage


def report_problem():
    try:
        description = request.form.get("description", "").strip()
        file = request.files.get("attachedFile")

        if not description:
            return jsonify({"error": "Description is required."}), 400

        # Email config
        sender = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")
        receiver = os.getenv("REPORT_RECEIVER_EMAIL", sender)

        if not (sender and password):
            return jsonify({"error": "Email credentials missing on server."}), 500

        # Build message
        msg = EmailMessage()
        msg["Subject"] = f"New Problem Report — {datetime.now():%Y-%m-%d %H:%M:%S}"
        msg["From"] = sender
        msg["To"] = receiver
        msg.set_content(f"Problem Description:\n\n{description}")

        if file:
            msg.add_attachment(
                file.read(),
                maintype="application",
                subtype="octet-stream",
                filename=file.filename,
            )

        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender, password)
            smtp.send_message(msg)

        print(f"Report email sent from {sender} to {receiver}")
        return jsonify({"status": "success", "message": "Report email sent."}), 200

    except Exception as e:
        print(f"Error sending report: {e}")
        return jsonify({"error": "Failed to process report.", "details": str(e)}), 500
