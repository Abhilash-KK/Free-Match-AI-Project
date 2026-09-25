from config import ADMIN_EMAIL, ADMIN_PASSWORD

from conftest import login, get_page_text


def test_project_verification(driver):

    login(
        driver,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Project Verification",
        "Verification",
        "Projects"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nProject verification content:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 17 PASSED - Project verification detected"
    )