from config import CLIENT_EMAIL, CLIENT_PASSWORD
from config import TEST_PROJECT_NAME

from conftest import login, click_text, get_page_text


def test_client_projects(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    # Navigation text
    # CHANGE "Projects" if your menu uses another name.

    click_text(
        driver,
        "Projects"
    )

    text = get_page_text(driver)

    print("\n========== PROJECT PAGE ==========")
    print(text[:3000])

    # Existing project name from config.py
    print(
        "\nLooking for project:",
        TEST_PROJECT_NAME
    )

    if TEST_PROJECT_NAME.lower() in text.lower():

        print(
            "Existing test project found"
        )

    else:

        print(
            "Project name not found on this page"
        )

    assert len(text.strip()) > 0

    print(
        "TEST 6 PASSED - Projects page loaded"
    )