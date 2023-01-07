import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import VideoCall from './VideoCall';

function App() {
	return (
		<div>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/VideoCall' element={<VideoCall />} />
				</Routes>
			</BrowserRouter>
			{/* <VideoCall/> */}
		</div>
	)
}

export default App
