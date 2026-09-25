from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, get_page_text


def test_hiring_view(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Hire",
        "Hiring",
        "Contract",
        "Freelancer"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nHiring-related content:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 10 PASSED - Hiring information detected"
    )