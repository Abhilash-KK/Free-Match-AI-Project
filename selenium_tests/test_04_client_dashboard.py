from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, get_page_text


def test_client_dashboard(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    text = get_page_text(driver)

    print("\nChecking Client Dashboard...")

    keywords = [
        "Dashboard",
        "Projects",
        "Profile",
        "Messages"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "Dashboard content found:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 4 PASSED - Client dashboard detected"
    )