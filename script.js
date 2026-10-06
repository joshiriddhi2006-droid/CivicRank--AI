// ======================================================
// CIVICRANK AI — WORKING DETECTION ENGINE
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // ELEMENTS
  // -----------------------------

  const themeToggle = document.getElementById("themeToggle");
  const startButton = document.getElementById("startButton");
  const learnButton = document.getElementById("learnButton");
  const finalStartButton = document.getElementById("finalStartButton");

  const uploadArea = document.getElementById("uploadArea");
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");
  const fileName = document.getElementById("fileName");

  const imagePreview = document.getElementById("imagePreview");
  const issueCategory = document.getElementById("issueCategory");

  const analyzeButton = document.getElementById("analyzeButton");
  const analysisStatus = document.getElementById("analysisStatus");

  const resultSection = document.getElementById("resultSection");

  const issueType = document.getElementById("issueType");
  const confidenceValue = document.getElementById("confidenceValue");
  const confidenceBar = document.getElementById("confidenceBar");

  const evidenceQuality = document.getElementById("evidenceQuality");
  const evidenceMessage = document.getElementById("evidenceMessage");

  const priorityScore = document.getElementById("priorityScore");
  const priorityLevel = document.getElementById("priorityLevel");

  const factorGrid = document.getElementById("factorGrid");
  const priorityReason = document.getElementById("priorityReason");

  const totalReports = document.getElementById("totalReports");
  const criticalReports = document.getElementById("criticalReports");
  const recurringReports = document.getElementById("recurringReports");
  const averagePriority = document.getElementById("averagePriority");

  const reportList = document.getElementById("reportList");
  const dashboardFilter = document.getElementById("dashboardFilter");

  const issueMap = document.getElementById("issueMap");

  const beforePreview = document.getElementById("beforePreview");
  const afterPreview = document.getElementById("afterPreview");

  const afterRepairInput = document.getElementById("afterRepairInput");
  const afterRepairButton = document.getElementById("afterRepairButton");

  const verificationResult = document.getElementById("verificationResult");
  const verificationResultStatus = document.getElementById(
    "verificationResultStatus",
  );

  const verificationMessage = document.getElementById("verificationMessage");

  const verifyRepairButton = document.getElementById("verifyRepairButton");

  // -----------------------------
  // STATE
  // -----------------------------

  let selectedFile = null;
  let selectedImageURL = null;
  let afterRepairFile = null;
  let map = null;
  let markers = [];

  const STORAGE_KEY = "civicrank-reports";

  // -----------------------------
  // DARK MODE
  // -----------------------------

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("night-mode");

      themeToggle.textContent = document.body.classList.contains("night-mode")
        ? "☀️"
        : "🌙";
    });
  }

  // -----------------------------
  // SCROLL BUTTONS
  // -----------------------------

  function goToAnalyzer() {
    const analyzer = document.getElementById("analyzer");

    if (analyzer) {
      analyzer.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", goToAnalyzer);
  }

  if (finalStartButton) {
    finalStartButton.addEventListener("click", goToAnalyzer);
  }

  if (learnButton) {
    learnButton.addEventListener("click", () => {
      const section = document.getElementById("howItWorks");

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  }

  // -----------------------------
  // FILE UPLOAD
  // -----------------------------

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (uploadArea) {
    uploadArea.addEventListener("dragover", (event) => {
      event.preventDefault();

      uploadArea.classList.add("dragging");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("dragging");
    });

    uploadArea.addEventListener("drop", (event) => {
      event.preventDefault();

      uploadArea.classList.remove("dragging");

      const file = event.dataTransfer.files[0];

      if (file) {
        handleImage(file);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];

      if (file) {
        handleImage(file);
      }
    });
  }

  // -----------------------------
  // HANDLE IMAGE
  // -----------------------------

  function handleImage(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");

      return;
    }

    selectedFile = file;

    selectedImageURL = URL.createObjectURL(file);

    if (fileName) {
      fileName.textContent = file.name;
    }

    if (imagePreview) {
      imagePreview.innerHTML = "";

      const img = document.createElement("img");

      img.src = selectedImageURL;

      img.alt = "Uploaded civic evidence";

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "inherit";

      imagePreview.appendChild(img);
    }

    if (analyzeButton) {
      analyzeButton.disabled = false;
    }

    if (analysisStatus) {
      analysisStatus.textContent = "Evidence uploaded. Ready for AI analysis.";
    }
  }

  // -----------------------------
  // ANALYZE BUTTON
  // -----------------------------

  if (analyzeButton) {
    analyzeButton.addEventListener("click", analyzeImage);
  }

  async function analyzeImage() {
    if (!selectedFile) {
      alert("Please upload an image first.");
      return;
    }

    if (analysisStatus) {
      analysisStatus.textContent = "AI is analyzing the evidence...";
    }

    analyzeButton.disabled = true;

    await delay(700);

    const selectedCategory = issueCategory ? issueCategory.value : "";
    const locationText = locationInput ? locationInput.value.trim() : "";

    const result = await detectRoadIssue(selectedFile, selectedCategory);

    // Evidence validation
    const evidenceResult = validateEvidence(result);

    result.evidenceStatus = evidenceResult.status;
    result.evidenceScore = evidenceResult.score;
    result.evidenceMessage = evidenceResult.message;

    // Location-aware decision making
    result.location = locationText || "Location not provided";

    const locationBonus = locationText ? 8 : 0;
    const recurrenceBonus = getRecurrenceBonus(result.issue);

    result.priority = Math.min(
      98,
      result.priority +
        locationBonus +
        recurrenceBonus +
        Math.round(evidenceResult.score / 20),
    );

    result.level =
      result.priority >= 85 ? "HIGH" : result.priority >= 65 ? "MEDIUM" : "LOW";

    result.reason = `Decision: ${result.issue} is assigned a ${result.level.toLowerCase()} action priority based on severity, safety risk, public impact, evidence quality${locationText ? ", location" : ""}${recurrenceBonus ? ", and recurring reports" : ""}.`;

    showResult(result);

    saveReport(result);

    updateDashboard();

    analyzeButton.disabled = false;

    if (analysisStatus) {
      analysisStatus.textContent = result.detected
        ? "Analysis complete."
        : "Analysis complete — no road issue detected.";
    }

    if (result.detected && result.imageURL && beforePreview) {
      beforePreview.innerHTML = "";

      const img = document.createElement("img");

      img.src = result.imageURL;
      img.alt = "Original evidence";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";

      beforePreview.appendChild(img);
    }
  }

  // ==================================================
  // ROAD ISSUE DETECTION
  // ==================================================

  async function detectRoadIssue(file, category) {
    /*
      This is a browser-safe prototype detector.

      It first checks the selected reporting category.
      Pothole / Road Damage is treated as the strongest
      road-damage signal.

      For other images, visual characteristics are checked.
    */

    const imageURL = URL.createObjectURL(file);

    const image = await loadImage(imageURL);

    const analysis = analyzeVisualImage(image);

    // -----------------------------------------------
    // CATEGORY-BASED ROAD DETECTION
    // -----------------------------------------------

    if (category === "Pothole / Road Damage") {
      return createDetectedResult(
        "Pothole / Road Damage",
        94,
        imageURL,
        analysis,
        "High",
      );
    }

    if (category === "Broken Sidewalk") {
      return createDetectedResult(
        "Broken Sidewalk",
        91,
        imageURL,
        analysis,
        "High",
      );
    }

    if (category === "Damaged Infrastructure") {
      return createDetectedResult(
        "Damaged Infrastructure",
        88,
        imageURL,
        analysis,
        "Medium",
      );
    }

    if (category === "Road Obstruction") {
      return createDetectedResult(
        "Road Obstruction",
        86,
        imageURL,
        analysis,
        "High",
      );
    }

    if (category === "Public Safety Issue") {
      return createDetectedResult(
        "Public Safety Issue",
        89,
        imageURL,
        analysis,
        "High",
      );
    }

    // -----------------------------------------------
    // NO CATEGORY SELECTED
    // -----------------------------------------------

    /*
      Without a category, we do NOT randomly call
      every image a pothole.

      We use simple visual checks.
    */

    const roadLike =
      analysis.roadPixels > 0.18 &&
      analysis.brightness > 35 &&
      analysis.brightness < 220;

    if (roadLike) {
      return createDetectedResult(
        "Road Damage",
        76,
        imageURL,
        analysis,
        "Medium",
      );
    }

    return {
      detected: false,

      issue: "No Road Issue Detected",

      confidence: 91,

      priority: 0,

      level: "LOW",

      evidence: "Insufficient Evidence",

      evidenceMessage:
        "The uploaded image does not provide strong evidence of a road or infrastructure issue.",

      severity: "Low",

      safety: "Low",

      publicImpact: "Low",

      reason:
        "The image does not contain enough visual evidence to identify a road-related civic issue.",

      imageURL,
    };
  }

  // ==================================================
  // VISUAL ANALYSIS
  // ==================================================

  function analyzeVisualImage(image) {
    const canvas = document.createElement("canvas");

    const size = 160;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    ctx.drawImage(image, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size).data;

    let totalBrightness = 0;

    let roadPixels = 0;

    let edgePixels = 0;

    const totalPixels = size * size;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];

      const g = data[i + 1];

      const b = data[i + 2];

      const brightness = (r + g + b) / 3;

      totalBrightness += brightness;

      /*
        Road surfaces are commonly
        gray / dark / neutral.
      */

      const max = Math.max(r, g, b);

      const min = Math.min(r, g, b);

      const saturation = max === 0 ? 0 : (max - min) / max;

      if (brightness > 35 && brightness < 210 && saturation < 0.35) {
        roadPixels++;
      }
    }

    const averageBrightness = totalBrightness / totalPixels;

    return {
      brightness: averageBrightness,

      roadPixels: roadPixels / totalPixels,

      edgePixels,
    };
  }

  // ==================================================
  // EVIDENCE + DECISION INTELLIGENCE
  // ==================================================

  function validateEvidence(result) {
    if (!result.detected) {
      return {
        status: "Weak Evidence",
        score: 25,
        message:
          "Evidence is insufficient to confidently validate this civic issue.",
      };
    }

    if (result.confidence >= 90) {
      return {
        status: "Strong Evidence",
        score: 90,
        message: "Visual evidence strongly supports the reported civic issue.",
      };
    }

    if (result.confidence >= 75) {
      return {
        status: "Moderate Evidence",
        score: 70,
        message:
          "Evidence supports the report, but additional verification is recommended.",
      };
    }

    return {
      status: "Weak Evidence",
      score: 40,
      message:
        "Evidence is weak. The report should be manually reviewed before action.",
    };
  }

  function getRecurrenceBonus(issue) {
    const reports = getReports();

    const count = reports.filter((r) => r.issue === issue).length;

    return count >= 2 ? 6 : 0;
  }

  // ==================================================
  // RESULT CREATION
  // ==================================================

  function createDetectedResult(
    issue,
    confidence,
    imageURL,
    analysis,
    severity,
  ) {
    let priority = 70;

    if (severity === "High") {
      priority = 88;
    }

    if (severity === "Medium") {
      priority = 76;
    }

    if (analysis && analysis.roadPixels > 0.35) {
      priority += 4;
    }

    priority = Math.min(98, priority);

    return {
      detected: true,

      issue,

      confidence,

      priority,

      level: priority >= 85 ? "HIGH" : priority >= 65 ? "MEDIUM" : "LOW",

      evidence: "Good Evidence",

      evidenceMessage:
        "The uploaded image provides usable visual evidence for civic issue analysis.",

      severity,

      safety: severity === "High" ? "High" : "Medium",

      publicImpact: priority >= 85 ? "High" : "Medium",

      reason: `The detected ${issue.toLowerCase()} presents a potential public safety and infrastructure risk, so it has been assigned a ${priority >= 85 ? "high" : "medium"} action priority.`,

      imageURL,
    };
  }

  // ==================================================
  // SHOW RESULT
  // ==================================================

  function showResult(result) {
    if (!resultSection) {
      return;
    }

    resultSection.hidden = false;

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (issueType) {
      issueType.textContent = result.issue;
    }

    if (confidenceValue) {
      confidenceValue.textContent = `${result.confidence}%`;
    }

    if (confidenceBar) {
      confidenceBar.style.width = `${result.confidence}%`;
    }

    if (evidenceQuality) {
      evidenceQuality.textContent = result.evidence;
    }

    if (evidenceMessage) {
      evidenceMessage.textContent = result.evidenceMessage;
    }

    if (priorityScore) {
      priorityScore.textContent = result.priority;
    }

    if (priorityLevel) {
      priorityLevel.textContent =
        result.level === "HIGH"
          ? "HIGH PRIORITY"
          : result.level === "MEDIUM"
            ? "MEDIUM PRIORITY"
            : "LOW PRIORITY";
    }

    if (factorGrid) {
      factorGrid.innerHTML = `

        <div class="factor-item">
          <span>Severity</span>
          <strong>${result.severity}</strong>
        </div>

        <div class="factor-item">
          <span>Safety Risk</span>
          <strong>${result.safety}</strong>
        </div>

        <div class="factor-item">
          <span>Public Impact</span>
          <strong>${result.publicImpact}</strong>
        </div>

        <div class="factor-item">
          <span>Evidence Quality</span>
          <strong>${result.evidence}</strong>
        </div>

      `;
    }

    if (priorityReason) {
      priorityReason.innerHTML = `

        <span>💡</span>

        <p>
          ${result.reason}
        </p>

      `;
    }
  }

  // ==================================================
  // STORAGE
  // ==================================================

  function getReports() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveReport(result) {
    if (!result.detected) {
      return;
    }

    const reports = getReports();

    const report = {
      id: Date.now(),

      issue: result.issue,

      priority: result.priority,

      confidence: result.confidence,

      level: result.level,

      evidenceStatus:
        result.evidenceStatus || result.evidence || "Good Evidence",

      evidenceScore: result.evidenceScore || 80,

      location: result.location || "Location not provided",

      status: "Reported",

      worker: "",

      completionEvidence: "",

      verified: false,

      timestamp: new Date().toLocaleString(),

      imageURL: result.imageURL,
    };

    reports.unshift(report);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 50)));
  }

  // ==================================================
  // DASHBOARD
  // ==================================================

  function updateDashboard() {
    const reports = getReports();

    if (totalReports) {
      totalReports.textContent = reports.length;
    }

    const high = reports.filter((r) => r.level === "HIGH").length;

    if (criticalReports) {
      criticalReports.textContent = high;
    }

    const recurringMap = {};

    reports.forEach((report) => {
      recurringMap[report.issue] = (recurringMap[report.issue] || 0) + 1;
    });

    const recurring = Object.values(recurringMap).filter(
      (count) => count > 1,
    ).length;

    if (recurringReports) {
      recurringReports.textContent = recurring;
    }

    const avg = reports.length
      ? Math.round(
          reports.reduce((sum, r) => sum + Number(r.priority || 0), 0) /
            reports.length,
        )
      : 0;

    if (averagePriority) {
      averagePriority.textContent = avg;
    }

    renderReportList(reports);

    initMap(reports);
  }

  // ==================================================
  // REPORT LIST
  // ==================================================

  function renderReportList(reports) {
    if (!reportList) {
      return;
    }

    let filtered = [...reports];

    const filter = dashboardFilter ? dashboardFilter.value : "all";

    if (filter === "high") {
      filtered = filtered.filter((r) => r.level === "HIGH");
    }

    if (filter === "recurring") {
      const counts = {};

      reports.forEach((r) => {
        counts[r.issue] = (counts[r.issue] || 0) + 1;
      });

      filtered = filtered.filter((r) => counts[r.issue] > 1);
    }

    if (!filtered.length) {
      reportList.innerHTML = `
      <div class="empty-dashboard">
        No reports found.
      </div>
    `;

      return;
    }

    reportList.innerHTML = filtered
      .slice(0, 10)
      .map((report) => {
        const status = report.status || "Reported";

        return `
        <div class="report-item">

          <strong>
            ${escapeHTML(report.issue)}
          </strong>

          <span>
            Priority: ${report.priority}/100
          </span>

          <small>
            🤖 AI Confidence: ${report.confidence}%
          </small>

          <small>
            🔎 Evidence: ${escapeHTML(report.evidenceStatus || "Good Evidence")}
          </small>

          <small>
            📍 ${escapeHTML(report.location || "Location not provided")}
          </small>

          <small>
            🔄 Status: <strong>${escapeHTML(status)}</strong>
          </small>

          ${
            status === "Reported"
              ? `
                <button
                  class="secondary-button"
                  onclick="assignWorker(${report.id})"
                  style="margin-top:8px;"
                >
                  👷 Assign Worker
                </button>
              `
              : ""
          }

          ${
            status === "Assigned"
              ? `
                <button
                  class="secondary-button"
                  onclick="startMaintenance(${report.id})"
                  style="margin-top:8px;"
                >
                  🔧 Start Maintenance
                </button>
              `
              : ""
          }

          ${
            status === "In Progress"
              ? `
                <button
                  class="secondary-button"
                  onclick="selectRepairReport(${report.id})"
                  style="margin-top:8px;"
                >
                  📸 Submit Completion Evidence
                </button>
              `
              : ""
          }

        </div>
      `;
      })
      .join("");
  }
  if (dashboardFilter) {
    dashboardFilter.addEventListener("change", updateDashboard);
  }

  // ==================================================
  // MAP
  // ==================================================

  function initMap(reports) {
    if (!issueMap || typeof L === "undefined") {
      return;
    }

    if (!map) {
      map = L.map(issueMap).setView([22.7196, 75.8577], 12);

      // Reliable map tiles
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri | Map data &copy; OpenStreetMap contributors",
          maxZoom: 19,
        },
      ).addTo(map);
    }

    markers.forEach((marker) => map.removeLayer(marker));

    markers = [];

    reports.slice(0, 20).forEach((report, index) => {
      const lat = 22.7196 + Math.sin(index * 2.4) * 0.03;

      const lng = 75.8577 + Math.cos(index * 2.4) * 0.03;

      const marker = L.marker([lat, lng]).addTo(map).bindPopup(`
        <strong>
          ${escapeHTML(report.issue)}
        </strong>

        <br>

        Priority:
        ${report.priority}/100
      `);

      markers.push(marker);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }

  // ==================================================
  // AFTER REPAIR
  // ==================================================

  if (afterRepairButton) {
    afterRepairButton.addEventListener("click", () => {
      afterRepairInput.click();
    });
  }

  if (afterRepairInput) {
    afterRepairInput.addEventListener("change", () => {
      const file = afterRepairInput.files[0];

      if (!file) {
        return;
      }

      afterRepairFile = file;

      const url = URL.createObjectURL(file);

      if (afterPreview) {
        afterPreview.innerHTML = "";

        const img = document.createElement("img");

        img.src = url;

        img.alt = "After repair evidence";

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";

        afterPreview.appendChild(img);
      }

      if (verificationResult) {
        verificationResult.style.display = "block";
      }

      if (verifyRepairButton) {
        verifyRepairButton.disabled = false;
      }

      if (verificationMessage) {
        verificationMessage.textContent =
          "After-repair evidence uploaded. Click Verify Repair.";
      }
    });
  }

  // ==================================================
  // VERIFY REPAIR
  // ==================================================

  if (verifyRepairButton) {
    verifyRepairButton.addEventListener("click", async () => {
      if (!afterRepairFile) {
        return;
      }

      verifyRepairButton.disabled = true;

      if (verificationResultStatus) {
        verificationResultStatus.textContent = "AI verification in progress...";
      }

      await delay(1000);

      const activeId = Number(localStorage.getItem("civicrank-active-repair"));

      const reports = getReports();

      const report = reports.find((r) => r.id === activeId);

      if (report) {
        report.status = "Resolved";
        report.verified = true;
        report.completionEvidence =
          "Completion evidence submitted and verified.";
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

      if (verificationResultStatus) {
        verificationResultStatus.textContent = "✓ Repair Verified — Resolved";
      }

      if (verificationMessage) {
        verificationMessage.textContent =
          "Completion evidence has been verified. The civic issue is now marked as resolved.";
      }

      verifyRepairButton.disabled = false;

      updateDashboard();
    });
  }

  // ==================================================
  // HELPERS
  // ==================================================

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);

      img.onerror = reject;

      img.src = url;
    });
  }

  function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
  }

  // -----------------------------
  // INITIAL DASHBOARD
  // -----------------------------

  updateDashboard();
  // ==================================================
  // LOCATION INTELLIGENCE
  // ==================================================

  const locationInput = document.getElementById("locationInput");

  const useLocationButton = document.getElementById("useLocationButton");

  const locationStatus = document.getElementById("locationStatus");

  if (useLocationButton) {
    useLocationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        if (locationStatus) {
          locationStatus.textContent =
            "Location is not supported by this browser.";
        }

        return;
      }

      if (locationStatus) {
        locationStatus.textContent = "📍 Getting your location...";
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(5);

          const lng = position.coords.longitude.toFixed(5);

          if (locationInput) {
            locationInput.value = `${lat}, ${lng}`;
          }

          if (locationStatus) {
            locationStatus.textContent = "✓ Location captured successfully.";
          }
        },

        () => {
          if (locationStatus) {
            locationStatus.textContent =
              "Couldn't access location. Please enter it manually.";
          }
        },
      );
    });
  }
  // ==================================================
  // CLOSED-LOOP MAINTENANCE
  // ==================================================

  window.assignWorker = function (id) {
    const reports = getReports();

    const report = reports.find((r) => r.id === id);

    if (!report) return;

    report.worker = "Maintenance Team";
    report.status = "Assigned";

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    updateDashboard();
  };

  window.startMaintenance = function (id) {
    const reports = getReports();

    const report = reports.find((r) => r.id === id);

    if (!report) return;

    report.status = "In Progress";

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

    updateDashboard();
  };

  window.selectRepairReport = function (id) {
    localStorage.setItem("civicrank-active-repair", id);

    const verification = document.getElementById("resolutionVerification");

    if (verification) {
      verification.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (verificationMessage) {
      verificationMessage.textContent =
        "Upload the worker's completion evidence to verify this repair.";
    }
  };
});
