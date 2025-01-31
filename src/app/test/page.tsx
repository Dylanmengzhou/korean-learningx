"use client";
import { useEffect } from "react";
import { testDatabaseConnection } from "@/app/actions/actions";

export default function Home() {
  useEffect(() => {
    testDatabaseConnection().then(console.log);
  }, []);

  return <h1>测试数据库连接</h1>;
}