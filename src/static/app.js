document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantItems = details.participants && details.participants.length
          ? details.participants.map(p => `
              <li>
                <span class="participant-email">${p}</span>
                <button class="remove-participant" data-email="${p}" title="Remove participant">✖</button>
              </li>`).join("")
          : '<li class="no-participants">No participants yet</li>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h5 class="participants-title">Participants</h5>
            <ul class="participants-list">
              ${participantItems}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Attach delete handlers for participant remove buttons
        activityCard.querySelectorAll(".remove-participant").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const email = btn.dataset.email;
            try {
              const res = await fetch(
                `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(email)}`,
                { method: "DELETE" }
              );

              const data = await res.json();
              if (res.ok) {
                // Refresh activities to reflect removal
                fetchActivities();
                messageDiv.textContent = data.message;
                messageDiv.className = "success";
              } else {
                messageDiv.textContent = data.detail || "Error removing participant";
                messageDiv.className = "error";
              }
              messageDiv.classList.remove("hidden");
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 4000);
            } catch (err) {
              messageDiv.textContent = "Failed to remove participant.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              console.error("Error removing participant:", err);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears without a full page reload
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
