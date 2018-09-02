import React, {Component} from 'react'
import ReactDOM from 'react-dom';
import { FormGroup, ControlLabel, FormControl, Label, Button, HelpBlock, Row, Col} from 'react-bootstrap';



class FileUpload extends Component {

	constructor(props, context) {
		super(props, context);

		this.handleTextChange = this.handleTextChange.bind(this);
		this.loadText = this.loadText.bind(this);
		this.state = {
			xmlText: '',
			showWarning: false
		};
	}

	getValidationState() {
		//const length = this.state.xmlText.length;
		if (this.state.showWarning) return 'error'
		//else if (length > 0) return 'success';
		//else if (length == 0) return 'warning';
		return null;
	}

	handleTextChange(e) {
		if (this.state.xmlText.length > 0) this.setState({showWarning: false})
		this.setState({ xmlText: e.target.value });
	}

	readFile(file) {
		const reader = new FileReader()
		reader.onload = event => {
			this.props.fileCB(event.target.result)
		}
		reader.onerror = error => console.log(error)
		reader.readAsText(file)
	}

	handleUpload(event){
		const input = event.target
		if ('files' in input && input.files.length > 0) {
			this.readFile(input.files[0])
		}
	}

	loadText() {
		if (this.state.xmlText.length < 1) {
			this.setState({showWarning: true})
		} else {
			this.setState({showWarning: false})
			this.props.fileCB(this.state.xmlText)
		}
	}


	render() {
		return (
			<form>
				<FormGroup>
					<ControlLabel htmlFor="fileUpload" style={{ cursor: "pointer"}}><h3><Label bsStyle="success">Choose file</Label></h3>
						<FormControl
							id="fileUpload"
							type="file"
							onChange={this.handleUpload.bind(this)}
							style={{ display: "none" }}
						/>
					</ControlLabel>
				</FormGroup>


				<div style={{padding: '0 0 1.5em 1.5em', background:'#fff'}}> — OR — </div>


				<FormGroup
					controlId="formBasicText"

				>
					<ControlLabel></ControlLabel>
						<FormControl
							componentClass="textarea"
							rows="9"
							value={this.state.xmlText}
							placeholder="Enter your XML here"
							onChange={this.handleTextChange}
						/>
						<FormControl.Feedback />
					{this.state.showWarning && <HelpBlock>Please enter some text in the box above.</HelpBlock>}
				</FormGroup>

				<Button onClick={this.loadText}>Open Text in Editor</Button>
			</form>
		)
	}
}
function initializeFileUploadComponent(targetElement, fileCB) {
	return ReactDOM.render(<FileUpload fileCB={fileCB} />, document.getElementById(targetElement))
}


export default initializeFileUploadComponent
