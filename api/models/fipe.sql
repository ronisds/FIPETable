DROP DATABASE IF EXISTS fipe;
CREATE DATABASE fipe;

\c fipe;

CREATE TABLE vehicles (
  ID SERIAL PRIMARY KEY,
  value VARCHAR,
  brand VARCHAR,
  model VARCHAR,
  modelYear INTEGER,
  fuel VARCHAR,
  fipeCode VARCHAR,
  referenceMonth VARCHAR,
  referenceTableId INTEGER,
  brandId INTEGER,
  modelId INTEGER,
  yearId VARCHAR
);

/*

INSERT INTO vehicles (value, brand, model, modelYear, fuel, fipeCode, referenceMonth, referenceTableId, brandId, modelId, yearId)
    VALUES ('10 real', 'aa', 'ae', 1, 'ad', 'ac', 'ab', 185, 3, 4, 'aaa');

INSERT INTO vehicles (value, brand, model, modelYear, fuel, fipeCode, referenceMonth, referenceTableId, brandId, modelId, yearId)
    VALUES ('101 real', 'aa', 'ae', 1, 'ad', 'ac', 'ab', 186, 3, 4, 'aaa');

*/
