from config import CLIENT_EMAIL, CLIENT_PASSWORD

from conftest import login, get_page_text


def test_tasks(driver):

    login(
        driver,
        CLIENT_EMAIL,
        CLIENT_PASSWORD
    )

    text = get_page_text(driver)

    keywords = [
        "Task",
        "Tasks",
        "Milestone",
        "Milestones"
    ]

    found = []

    for keyword in keywords:

        if keyword.lower() in text.lower():

            found.append(keyword)

    print(
        "\nTask/Milestone content:",
        found
    )

    assert len(found) > 0

    print(
        "TEST 12 PASSED - Task/Milestone information detected"
    )