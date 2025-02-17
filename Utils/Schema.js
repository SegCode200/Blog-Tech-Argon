import Joi from "joi";

export const userValidate = Joi.object({
  name : Joi.string().required().min(5),
  email: Joi.string().required().email({tlds: { allow: ['com'] }}),
  password: Joi.string().required().min(6),
})