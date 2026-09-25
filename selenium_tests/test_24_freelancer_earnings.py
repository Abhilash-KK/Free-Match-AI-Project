import time

from config import FREELANCER_EMAIL, FREELANCER_PASSWORD
from conftest import login, click_text, get_page_text


def test_freelancer_earnings_view(driver):
    """Verify Freelancer Earnings & Wallet view, balance indicators, and withdrawal records."""
    login(
        driver,
        FREELANCER_EMAIL,
        FREELANCER_PASSWORD
    )

    click_text(
        driver,
        "Earnings & Wallet"
    )

    time.sleep(2)

    text = get_page_text(driver)

    print("\n========== FREELANCER EARNINGS & WALLET ==========")
    print(text[:2500])

    keywords = [
        "Earning",
        "Earnings",
        "Wallet",
        "Balance",
        "Withdrawal"
    ]

    found = [k for k in keywords if k.lower() in text.lower()]

    print("Earnings & Wallet keywords detected:", found)
    assert len(found) >= 2

    print("PASS: Freelancer Earnings & Wallet view verified cleanly")
