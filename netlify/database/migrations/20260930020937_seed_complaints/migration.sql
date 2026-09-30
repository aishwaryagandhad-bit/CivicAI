-- Custom SQL migration file, put your code below! --
INSERT INTO "complaints" ("id","category","description","location","lat","lng","reported_on","priority","status","citizen","department","reports") VALUES
(10245,'Roads','Large pothole near Gate 2','MG Road, Ward 24',12.97560,77.60500,'2026-09-24','High','Under Review','Asha Rao','Unassigned',3),
(10238,'Streetlights','Streetlight not working on 5th Cross','5th Cross, Ward 24',12.97400,77.60850,'2026-09-22','Medium','Assigned','Asha Rao','Electricity',4),
(10221,'Water','Water pipe leaking near the market','Market Road, Ward 22',12.96650,77.57750,'2026-09-19','High','In Progress','Asha Rao','Water',9),
(10190,'Waste','Garbage not collected for 4 days','Lake View Layout',12.93520,77.62450,'2026-09-10','Low','Resolved','Asha Rao','Waste Management',6),
(10199,'Roads','Pothole near Gate 2, MG Road','Gate 2, MG Road',12.97580,77.60620,'2026-09-15','High','Assigned','Priya N','Roads',18),
(10251,'Sanitation','Open drain overflowing','Temple Street, Ward 24',12.97900,77.61000,'2026-09-26','High','Submitted','Karan S','Unassigned',7),
(10233,'Transport','Bus stop shelter damaged','Ring Road Stop 4',12.92500,77.67000,'2026-09-21','Low','Under Review','Meera J','Transport',2),
(10260,'Electricity','Transformer sparking at night','Park Avenue, Ward 18',12.99000,77.59500,'2026-09-27','High','Assigned','Farhan A','Electricity',5),
(10202,'Roads','Broken footpath tiles','College Road',12.96000,77.59000,'2026-09-12','Medium','Resolved','Neha T','Roads',4)
ON CONFLICT ("id") DO NOTHING;
