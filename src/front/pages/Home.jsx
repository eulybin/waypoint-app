import React from "react"
import SearchBar from "../components/SearchBar";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Home = () => {

	const { store } = useGlobalReducer()

	return (
		<>
			{store.userIsLoggedIn ? <div className="text-center pt-5 display-1">Home Component</div> : <SearchBar />}
		</>
	);
}; 