import json, random, datetime

projects = ["Nova","Vertex","Atlas","Orion"]
sources = ["slack","jira","github","email","calendar"]

phrases = {
"blocker":[
"blocking deployment pipeline",
"cannot merge due to failing tests",
"dependency not resolved",
"schema mismatch blocking release",
"auth service timeout issue"
],
"client":[
"client asking for update urgently",
"client followup again",
"client requesting timeline confirmation",
"client escalated concern",
"client waiting response"
],
"progress":[
"commit improve validation logic",
"merge fix api response",
"update ui layout",
"refactor service layer",
"improve logging coverage"
],
"approval":[
"approval pending stakeholder review",
"awaiting signoff",
"waiting approval 3 days",
"legal confirmation required",
"pending stakeholder confirmation"
]
}

def gen_events(n=150):
    base = datetime.datetime(2026,1,1,14,0)
    events=[]
    for i in range(n):
        t = base + datetime.timedelta(minutes=i%30)
        typ=random.choice(list(phrases.keys()))
        events.append({
            "timestamp":t.strftime("%H:%M"),
            "source":random.choice(sources),
            "project":random.choice(projects),
            "text":random.choice(phrases[typ])
        })
    return events

for i in range(3,11):
    data={
        "sample_id":f"sample_{i:02}",
        "window":"30min",
        "events":gen_events(150)
    }
    with open(f"datasets/sample_{i:02}.json","w") as f:
        json.dump(data,f,indent=2)

print("generated 150-event datasets")
