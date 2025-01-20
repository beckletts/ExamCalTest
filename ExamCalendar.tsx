import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ExamData {
  date: Date;
  examSeries: string;
  board: string;
  qualification: string;
  examCode: string;
  subject: string;
  title: string;
  time: string;
  duration: string;
  level?: string;
  unit?: string;
  part?: string;
  windowStart?: Date | null;
  windowEnd?: Date | null;
  additionalInfo?: string;
}

const COLORS = {
  chalkWhite: "#FFFFFF",
  inkBlack: "#000000",
  mistGrey: "#DFE1E1",
  graphiteGrey: "#505759",
  brightOrange: "#FFBB1C",
  marineTurquoise: "#12B2A6",
  freshGreen: "#84BD00",
};

const EXAM_COLORS: Record<string, string> = {
  GCSE: COLORS.marineTurquoise,
  "RQF BTEC National": COLORS.freshGreen,
};

const ExamCalendar: React.FC = () => {
  const [examData, setExamData] = useState<ExamData[]>([]);
  const [filteredData, setFilteredData] = useState<ExamData[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 4, 1));
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [selectedExam, setSelectedExam] = useState<ExamData[] | null>(null);

  const processExcelFile = async (file: File) => {
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

      const normalizedData = data.map((row: any) => ({
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

      setExamData((prevData) => [...prevData, ...normalizedData]);
      setFilteredData((prevData) => [...prevData, ...normalizedData]);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    if (value === "ALL") {
      setFilteredData(examData);
    } else {
      setFilteredData(examData.filter((exam) => exam.qualification === value));
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 5, and Saturday (6) to 4
    // Monday (1) becomes 0, Tuesday (2) becomes 1, etc.
    return firstDay === 0 ? 4 : firstDay === 6 ? 4 : firstDay - 1;
  };

  const getExamsForDate = (date: number) => {
    return filteredData.filter(
      (exam) =>
        exam.date.getDate() === date &&
        exam.date.getMonth() === currentDate.getMonth() &&
        exam.date.getFullYear() === currentDate.getFullYear()
    );
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
              const files = Array.from(e.target.files || []);
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
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
          }}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
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

          {Array.from({ length: getDaysInMonth(currentDate) })
            .map((_, index) => {
              const date = index + 1;
              const dayOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                date
              ).getDay();
              // Skip weekends (0 is Sunday, 6 is Saturday)
              if (dayOfWeek === 0 || dayOfWeek === 6) return null;
              const exams = getExamsForDate(date);
              return (
                <div
                  key={date}
                  onClick={() => exams.length > 0 && setSelectedExam(exams)}
                  style={{
                    border: `1px solid ${COLORS.mistGrey}`,
                    minHeight: "100px",
                    padding: "8px",
                    cursor: exams.length > 0 ? "pointer" : "default",
                  }}
                >
                  <div>{date}</div>
                  {exams.length > 0 && (
                    <div style={{ marginTop: "4px" }}>
                      {Object.entries(
                        exams.reduce((acc: Record<string, number>, exam) => {
                          acc[exam.qualification] =
                            (acc[exam.qualification] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([qualification, count]) => (
                        <div
                          key={qualification}
                          style={{
                            color: EXAM_COLORS[qualification],
                            fontSize: "14px",
                            backgroundColor: `${EXAM_COLORS[qualification]}15`,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginBottom: "2px",
                            border: `1px solid ${EXAM_COLORS[qualification]}`,
                          }}
                        >
                          {count} {qualification} exam{count > 1 ? "s" : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
            .filter((day) => day !== null)}
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
                  border: `1px solid ${EXAM_COLORS[exam.qualification]}`,
                  borderRadius: "4px",
                  padding: "16px",
                  backgroundColor: `${EXAM_COLORS[exam.qualification]}10`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Calendar
                    style={{ color: EXAM_COLORS[exam.qualification] }}
                  />
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
