import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout({
  searchData,
  setSearchData,
  handleSearch,
  activeTab,
  setActiveTab,
  resetSearch, 
}) {
  return (
    <>
      {/* Global Navbar */}
      <Navbar
        searchData={searchData}
        setSearchData={setSearchData}
        handleSearch={handleSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resetSearch={resetSearch}
      />

      {/* Main content area below navbar */}
      <div className="-pt-10">
        <Outlet />
      </div>
    </>
  );
}
