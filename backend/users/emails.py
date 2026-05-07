from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_magic_link_email(to_email: str, magic_link: str, first_name: str = '') -> None:
    """
    Sends a magic link email to the user.
    The link contains a secure token that logs them in instantly when clicked.
    """
    subject = 'Your Sign-In Link for Staplate'
    
    context = {
        'name': first_name,
        'magic_link': magic_link
    }
    
    html_message = render_to_string('emails/magic_link.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


def send_otp_email(to_email: str, otp: str, first_name: str = '') -> None:
    """
    Sends a 6-digit OTP code to the user's email.
    The user types this code into the frontend to log in.
    """
    subject = f'{otp} is your Staplate authentication code'
    
    context = {
        'name': first_name,
        'otp': otp
    }

    html_message = render_to_string('emails/otp.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(to_email: str, reset_link: str, first_name: str = '') -> None:
    """
    Sends a password reset link to the user.
    """
    subject = 'Reset your Staplate password'
    
    context = {
        'name': first_name,
        'reset_link': reset_link
    }
    
    html_message = render_to_string('emails/password_reset.html', context)
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )
