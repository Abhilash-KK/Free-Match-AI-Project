from config import ADMIN_EMAIL, ADMIN_PASSWORD

from conftest import login, get_page_text


def test_identity_verification(driver):

    login(
        driver,
        ADMIN_EMAIL,
        ADMIN_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Identity Verification",
        "Identity",
        "Verification"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nIdentity verification content:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 18 PASSED - Identity verification detected"
    )