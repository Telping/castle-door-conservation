-- Add geolocation fields to sites and assessments

-- Add latitude/longitude to sites table
ALTER TABLE public.sites
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7),
ADD COLUMN county TEXT;

-- Add geolocation to assessments (for where the photo was taken)
ALTER TABLE public.assessments
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7),
ADD COLUMN geolocation_accuracy DECIMAL(10, 2);

-- Create index for geospatial queries
CREATE INDEX idx_sites_location ON public.sites(latitude, longitude);
CREATE INDEX idx_assessments_location ON public.assessments(latitude, longitude);

-- Update existing sites with real Irish castle data
DELETE FROM public.sites;

INSERT INTO public.sites (name, location, description, latitude, longitude, county) VALUES
-- Munster
('Bunratty Castle', 'Bunratty, County Clare', 'A large 15th-century tower house in County Clare. The castle and the adjoining folk park are run by Shannon Heritage as a tourist attraction.', 52.6983, -8.8103, 'Clare'),
('Blarney Castle', 'Blarney, County Cork', 'A medieval stronghold built in 1446 and famous for the Blarney Stone. Features a magnificent tower house with murder holes and machicolations.', 51.9291, -8.5708, 'Cork'),
('Cahir Castle', 'Cahir, County Tipperary', 'One of Ireland''s largest and best-preserved castles, dating from 1142. Located on an island in the River Suir.', 52.3748, -7.9273, 'Tipperary'),
('King John''s Castle', 'Limerick City, County Limerick', 'A 13th-century castle located on King''s Island in Limerick. One of the best-preserved Norman castles in Ireland.', 52.6692, -8.6245, 'Limerick'),
('Rock of Cashel', 'Cashel, County Tipperary', 'A spectacular group of medieval buildings set on an outcrop of limestone. The site includes a 12th-century round tower, High Cross, and Romanesque Chapel.', 52.5204, -7.8909, 'Tipperary'),
('Desmond Castle', 'Kinsale, County Cork', 'A 16th-century tower house originally built as a customs house. Also known as the French Prison.', 51.7063, -8.5253, 'Cork'),

-- Leinster
('Trim Castle', 'Trim, County Meath', 'The largest Anglo-Norman castle in Ireland, construction began in 1176. Features a massive three-storey keep.', 53.5548, -6.7894, 'Meath'),
('Kilkenny Castle', 'Kilkenny City, County Kilkenny', 'Built in 1195 to control the River Nore crossing. Remodeled in Victorian times and now a major tourist attraction.', 52.6504, -7.2494, 'Kilkenny'),
('Dublin Castle', 'Dublin City, County Dublin', 'A major Irish government complex and conference center. Originally a medieval fortress, with the Record Tower dating from 1228.', 53.3429, -6.2674, 'Dublin'),
('Malahide Castle', 'Malahide, County Dublin', 'Medieval castle dating back to the 12th century. Home to the Talbot family for 791 years.', 53.4449, -6.1581, 'Dublin'),
('Swords Castle', 'Swords, County Dublin', 'An example of a medieval walled town. The castle was the manorial residence of the Archbishops of Dublin.', 53.4597, -6.2186, 'Dublin'),
('Maynooth Castle', 'Maynooth, County Kildare', 'Largest and most important castle in medieval Ireland held by the FitzGerald family, Earls of Kildare.', 53.3816, -6.5933, 'Kildare'),

-- Connacht
('Dunguaire Castle', 'Kinvara, County Galway', 'A 16th-century tower house on the shores of Galway Bay. One of Ireland''s most photographed castles.', 53.1426, -8.9314, 'Galway'),
('Ashford Castle', 'Cong, County Mayo', 'A medieval and Victorian castle that has been expanded over the centuries. Now operates as a five-star hotel.', 53.5407, -9.3461, 'Mayo'),
('Athenry Castle', 'Athenry, County Galway', 'A Norman castle built in 1235. The town retains the most intact medieval walls in Ireland.', 53.4240, -8.7464, 'Galway'),
('Roscommon Castle', 'Roscommon, County Roscommon', 'A Norman castle built in 1269. Features an almost rectangular layout with towers at each corner.', 53.6325, -8.1886, 'Roscommon'),

-- Ulster
('Dunluce Castle', 'Bushmills, County Antrim', 'Dramatically sited on the edge of a basalt outcrop. The ruins date mostly from the 16th and 17th centuries.', 55.2107, -6.5795, 'Antrim'),
('Carrickfergus Castle', 'Carrickfergus, County Antrim', 'A Norman castle dating from 1177. One of the best preserved medieval structures in Ireland.', 54.7144, -5.8070, 'Antrim'),
('Enniskillen Castle', 'Enniskillen, County Fermanagh', 'Built in the early 15th century by Gaelic Maguire chieftains. Now houses the Fermanagh County Museum.', 54.3440, -7.6389, 'Fermanagh'),
('Donegal Castle', 'Donegal Town, County Donegal', 'A castle incorporating a 15th-century tower house with later Jacobean additions.', 54.6543, -8.1108, 'Donegal');
