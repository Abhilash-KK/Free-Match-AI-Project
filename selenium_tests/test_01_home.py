from config import BASE_URL


def test_home(driver):

    # URL TO TEST:
    # http://localhost:3000
    driver.get(BASE_URL)

    print("\nURL:", driver.current_url)
    print("TITLE:", driver.title)

    assert driver.title != ""

    print("TEST 1 PASSED - Home page loaded")