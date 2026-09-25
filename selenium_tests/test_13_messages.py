from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, click_text, get_page_text


def test_messages(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    click_text(
        driver,
        "Messages"
    )

    text = get_page_text(driver)

    print("\n========== MESSAGES ==========")
    print(text[:3000])

    assert "message" in text.lower()

    print(
        "TEST 13 PASSED - Messages displayed"
    )