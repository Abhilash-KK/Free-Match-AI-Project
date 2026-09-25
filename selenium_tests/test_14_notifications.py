from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, get_page_text


def test_notifications(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Notification",
        "Notifications"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nNotifications found:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 14 PASSED - Notifications detected"
    )