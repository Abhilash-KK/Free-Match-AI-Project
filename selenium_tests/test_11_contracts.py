from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, click_text, get_page_text


def test_contracts(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    click_text(
        driver,
        "Contracts"
    )

    text = get_page_text(driver)

    print("\n========== CONTRACTS ==========")
    print(text[:3000])

    assert "contract" in text.lower()

    print(
        "TEST 11 PASSED - Contracts displayed"
    )