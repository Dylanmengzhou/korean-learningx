import { z } from "zod";

export const updateCurrentPassword = z
	.string()
	.min(8, { message: "当前密码长度至少为8位" })
	.max(32, { message: "当前密码长度不能超过32位" });

export const updateNewPassword = z
	.string()
	.min(8, { message: "新密码长度至少为8位" })
	.max(32, { message: "新密码长度不能超过32位" });

export const updatePassword = z
	.string()
	.min(8, { message: "密码长度至少为8位" })
	.max(32, { message: "密码长度不能超过32位" });

export const emailCheck = z
	.string()
	.email({ message: "邮箱格式不正确" })
	.min(1, { message: "邮箱不能为空" });
