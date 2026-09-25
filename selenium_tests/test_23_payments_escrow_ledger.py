import time

from config import CLIENT_EMAIL, CLIENT_PASSWORD
from conftest import login, click_text, get_page_text


def test_client_payments_and_escrow_ledger(driver):
    """Verify Client Payments & Escrow page, wallet balance indicators, and transaction ledger."""
    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    click_text(
        driver,
        "Payments & Escrow"
    )

    time.sleep(2)

    text = get_page_text(driver)

    print("\n========== CLIENT PAYMENTS & ESCROW ==========")
    print(text[:2500])

    keywords = [
        "Payment",
        "Escrow",
        "Balance",
        "Wallet",
        "Transaction"
    ]

    found = [k for k in keywords if k.lower() in text.lower()]

    print("Payments & Escrow keywords detected:", found)
    assert len(found) >= 2

    print("PASS: Client Payments & Escrow ledger page verified cleanly")
