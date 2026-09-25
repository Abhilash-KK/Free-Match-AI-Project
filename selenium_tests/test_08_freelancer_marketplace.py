from config import FREELANCER_EMAIL
from config import FREELANCER_PASSWORD

from conftest import login, click_text, get_page_text


def test_freelancer_marketplace(driver):

    login(
        driver,
        FREELANCER_EMAIL,
        FREELANCER_PASSWORD
    )

    # CHANGE "Marketplace" if your actual
    # menu uses another name.

    try:
        click_text(
            driver,
            "Browse Jobs Feed"
        )
    except Exception:
        click_text(
            driver,
            "Marketplace"
        )

    text = get_page_text(driver)

    print("\n========== MARKETPLACE ==========")
    print(text[:3000])

    assert len(text.strip()) > 0

    print(
        "TEST 8 PASSED - Marketplace loaded"
    )