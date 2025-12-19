let campaignId = null;

document.getElementById("mailerForm").onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    campaignId = data.campaign_id;
    alert("CSV uploaded and validated");
};

function sendEmails() {
    if (!campaignId) {
        alert("Please upload CSV first");
        return;
    }

    fetch(`/send/${campaignId}`)
        .then(res => res.json())
        .then(() => alert("Emails sent successfully"));
}