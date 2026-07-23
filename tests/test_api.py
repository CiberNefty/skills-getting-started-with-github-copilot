from urllib.parse import quote


def test_get_activities(client):
    r = client.get("/activities")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_success(client):
    name = "Basketball Team"
    email = "tester@example.com"
    r = client.post(f"/activities/{quote(name)}/signup?email={email}")
    assert r.status_code == 200

    data = client.get("/activities").json()
    assert email in data[name]["participants"]


def test_signup_duplicate(client):
    name = "Swimming Club"
    email = "dup@example.com"
    r1 = client.post(f"/activities/{quote(name)}/signup?email={email}")
    assert r1.status_code == 200
    r2 = client.post(f"/activities/{quote(name)}/signup?email={email}")
    assert r2.status_code == 400


def test_remove_participant(client):
    name = "Art Studio"
    email = "rem@example.com"
    # sign up first
    r1 = client.post(f"/activities/{quote(name)}/signup?email={email}")
    assert r1.status_code == 200

    r2 = client.delete(f"/activities/{quote(name)}/participants?email={email}")
    assert r2.status_code == 200

    data = client.get("/activities").json()
    assert email not in data[name]["participants"]


def test_remove_nonexistent_participant(client):
    name = "Debate Team"
    email = "noone@example.com"
    r = client.delete(f"/activities/{quote(name)}/participants?email={email}")
    assert r.status_code == 404
