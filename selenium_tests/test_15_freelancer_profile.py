from config import FREELANCER_EMAIL
from config import FREELANCER_PASSWORD

from conftest import login, click_text, get_page_text


def test_freelancer_profile(driver):

    login(
        driver,
        FREELANCER_EMAIL,
        FREELANCER_PASSWORD
    )

    click_text(
        driver,
        "Profile"
    )

    text = get_page_text(driver)

    print("\n========== FREELANCER PROFILE ==========")
    print(text[:3000])

    keywords = [
        "Profile",
        "Skills",
        "Experience",
        "Education"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nProfile information:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 15 PASSED - Freelancer profile detected"
    )