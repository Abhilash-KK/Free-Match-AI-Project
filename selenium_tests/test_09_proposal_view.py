from config import FREELANCER_EMAIL
from config import FREELANCER_PASSWORD

from conftest import login, get_page_text


def test_proposal_view(driver):

    login(
        driver,
        FREELANCER_EMAIL,
        FREELANCER_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Proposal",
        "Proposals",
        "Application",
        "Applications",
        "Bid"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nProposal-related content:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 9 PASSED - Proposal information detected"
    )