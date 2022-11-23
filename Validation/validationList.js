const { object, string, array, number, boolean } = require("yup");

const stringCondition = string("value must be a string")
  .required("This field cannot be empty")
  .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field");

const perfumeSchema = object({
  name: stringCondition,
  description: string().required(),
  type: string().required(),
  yearLaunch: number().required(),
  price: float().required(),
  color: string().required(),
  pic: string().url("This must be a valid URL").required(),
  occasion: string().required(),
  ingredient: array().required(),
  scent: string().required(),
  halal: boolean().required(),
  volume: array().required(),
  brand: string().required(),
});

module.exports = { perfumeSchema };
