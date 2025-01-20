// ExamCalendar.js
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// Pearson color constants
const COLORS = {
  chalkWhite: "#FFFFFF",
  inkBlack: "#000000",
  mistGrey: "#DFE1E1",
  graphiteGrey: "#505759",
  brightOrange: "#FFBB1C",
  marineTurquoise: "#12B2A6",
  freshGreen: "#84BD00",
};

const EXAM_COLORS = {
  GCSE: COLORS.marineTurquoise,
  "RQF BTEC National": COLORS.freshGreen,
};

const ExamCalendar = () => {
  const [examData, setExamData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1));
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [selectedExam, setSelectedExam] = useState(null);

  const processExcelFile = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        cellDates: true,
        cellStyles: true,
      });

      const examSheet = workbook.Sheets["All papers"];
      if (!examSheet) {
        throw new Error('Could not find "All papers" sheet');
      }

      const data = XLSX.utils.sheet_to_json(examSheet);

      const normalizedData = data.map((row) => ({
        date: new Date(row.Date),
        examSeries: row["Exam series"],
        board: row.Board,
        qualification: row.Qual || "Unknown",
        examCode: row["Examination code"],
        subject: row.Subject,
        title: row.Title,
        time: row.Time,
        duration: row.Duration,
        level: row.Level,
        unit: row.Unit,
        part: row.Part,
        windowStart: row["Window start"] ? new Date(row["Window start"]) : null,
        windowEnd: row["Window end"] ? new Date(row["Window end"]) : null,
        additionalInfo: row["Additional information"],
      }));

      setExamData([...examData, ...normalizedData]);
      setFilteredData([...examData, ...normalizedData]);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getExamsForDate = (date) => {
    return filteredData.filter(
      (exam) =>
        exam.date.getDate() === date &&
        exam.date.getMonth() === currentDate.getMonth() &&
        exam.date.getFullYear() === currentDate.getFullYear()
    );
  };

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    if (value === "ALL") {
      setFilteredData(examData);
    } else {
      setFilteredData(examData.filter((exam) => exam.qualification === value));
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Open Sans, sans-serif",
        color: COLORS.graphiteGrey,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Exam Calendar</h2>
        <div style={{ display: "flex", gap: "16px" }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              files.forEach(processExcelFile);
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: COLORS.marineTurquoise,
              color: COLORS.chalkWhite,
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
            }}
          />
          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{
              padding: "8px 16px",
              border: `1px solid ${COLORS.mistGrey}`,
              borderRadius: "4px",
              color: COLORS.graphiteGrey,
            }}
          >
            <option value="ALL">All Qualifications</option>
            <option value="GCSE">GCSE</option>
            <option value="RQF BTEC National">BTEC</option>
          </select>
        </div>
      </div>

      <div
        style={{
          backgroundColor: COLORS.chalkWhite,
          border: `1px solid ${COLORS.mistGrey}`,
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: `1px solid ${COLORS.mistGrey}`,
            paddingBottom: "10px",
          }}
        >
          <h3 style={{ fontSize: "20px" }}>
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              style={{
                padding: "8px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              style={{
                padding: "8px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                padding: "8px",
                fontWeight: "600",
              }}
            >
              {day}
            </div>
          ))}

          {Array.from({ length: getFirstDayOfMonth(currentDate) }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                style={{
                  border: `1px solid ${COLORS.mistGrey}`,
                  minHeight: "100px",
                  padding: "8px",
                }}
              />
            )
          )}

          {Array.from({ length: getDaysInMonth(currentDate) }).map(
            (_, index) => {
              const date = index + 1;
              const exams = getExamsForDate(date);
              return (
                <div
                  key={date}
                  onClick={() => exams.length > 0 && setSelectedExam(exams)}
                  style={{
                    border: `1px solid ${
                      exams.length > 0
                        ? COLORS.marineTurquoise
                        : COLORS.mistGrey
                    }`,
                    minHeight: "100px",
                    padding: "8px",
                    backgroundColor:
                      exams.length > 0
                        ? `${COLORS.marineTurquoise}10`
                        : "transparent",
                    cursor: exams.length > 0 ? "pointer" : "default",
                  }}
                >
                  <div>{date}</div>
                  {exams.length > 0 && (
                    <div
                      style={{
                        color: COLORS.marineTurquoise,
                        fontSize: "14px",
                        marginTop: "4px",
                      }}
                    >
                      {exams.length} exam{exams.length > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {selectedExam && (
        <div style={{ marginTop: "24px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Exams on {selectedExam[0].date.toLocaleDateString()}
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {selectedExam.map((exam, index) => (
              <div
                key={index}
                style={{
                  border: `1px solid ${COLORS.marineTurquoise}`,
                  borderRadius: "4px",
                  padding: "16px",
                  backgroundColor: `${COLORS.marineTurquoise}10`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Calendar style={{ color: COLORS.marineTurquoise }} />
                  <h4
                    style={{
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {exam.subject} - {exam.title}
                  </h4>
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <p>
                    <strong>Qualification:</strong> {exam.qualification}
                  </p>
                  <p>
                    <strong>Exam Code:</strong> {exam.examCode}
                  </p>
                  <p>
                    <strong>Time:</strong> {exam.time}
                  </p>
                  <p>
                    <strong>Duration:</strong> {exam.duration}
                  </p>
                  {exam.unit && (
                    <p>
                      <strong>Unit:</strong> {exam.unit}
                    </p>
                  )}
                  {exam.part && (
                    <p>
                      <strong>Part:</strong> {exam.part}
                    </p>
                  )}
                  {exam.additionalInfo && (
                    <p style={{ fontSize: "14px", marginTop: "8px" }}>
                      {exam.additionalInfo}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCalendar;
