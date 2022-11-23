const { object, string, array, number, boolean } = require("yup");

const stringCondition = string("value must be a string")
  .required("This field cannot be empty")
  .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for this field");

const perfumeSchema = object({
  name: stringCondition,
  description: stringCondition,
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

const brandSchema = object({
  name: stringCondition,
  description: stringCondition,
  brandUrl: string().url("This must be a valid URL").required(),
});

const userSchema = object({
  name: stringCondition,
  email: string().email().required(),
  gender: string().required(),
});

const reviewSchema = object({
  name: stringCondition,
  email: string().email().required(),
  rating: number().required(),
  description: string().required(),
});

module.exports = { perfumeSchema, brandSchema, userSchema, reviewSchema };
