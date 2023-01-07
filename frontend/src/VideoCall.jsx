import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import "./App.css"
import {useNavigate} from 'react-router-dom';


const socket = io.connect('http://localhost:4500/')
function VideoCall() {
	const [ me, setMe ] = useState("")
	const [reject,Setreject] =useState(true);
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("Stranger")
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			   setStream(stream)
				myVideo.current.srcObject = stream
		})

	socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}
     
	const answerCall =() =>  {
		setCallAccepted(true)
		document.getElementById('user').style.display='block';
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}
   const rejectedCall = ()=>{
	  Setreject(false);
	  setCallAccepted(false);
	  connectionRef.current = null;
	  window.location.reload();
   }
   const navigate = useNavigate();
	const leaveCall = () => {
		setCallEnded(true)
		document.getElementById('user').style.display='none';
        navigate('/');
		connectionRef.current.destroy()
	}
	const ToggleMic = ()=>{
		console.log('mic toggled');
		const mic =stream.getAudioTracks()[0].enabled;
		stream.getAudioTracks()[0].enabled =!mic;
	}
	const ToggleCamera = ()=>{
        console.log("camera toggled");
		 const cam =stream.getVideoTracks()[0].enabled;
        stream.getVideoTracks()[0].enabled =!cam;
	}
    
	

	return (
		<div className="bod">
			<h1 style={{ textAlign: "center", color: '#fff' }}>Internship Project</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<br/> 
				<br/>
				<div className="video" id="user">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "500px"}} />
					:
					null
					}
				</div>
			</div>
			<div className="myId">
				<TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
				<CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
					<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button>
				</CopyToClipboard>

				<TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/> 
				<div className="call-button">
					{callAccepted && !callEnded ? (
							<>
				   <Button variant="contained" color="secondary" onClick={ToggleCamera}>
					 Toggle camera
					</Button>
					<br/> <br/>
					<Button variant="contained" color="secondary" onClick={ToggleMic}>
						ToggleMic
					</Button>
					<br/> <br/>
						<Button variant="contained" color="secondary" onClick={leaveCall}>
							End Call
						</Button>
							</>
					) : (
						<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							<PhoneIcon fontSize="large" />
							
						</IconButton>
					     	
					)
					}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
					    { reject ? (
						<div>		
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
						<br/> <br/>
						<Button variant="contained" color="primary" onClick={rejectedCall}>
							Reject 
						</Button>
						</div>
						 ) : null} 
					</div>
				) : null}
			</div>
		</div>
		</div>
	)
}

export default VideoCall
