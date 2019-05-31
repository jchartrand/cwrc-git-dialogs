import React, {Component} from 'react'
import {FormGroup, InputGroup, FormControl, Button, Glyphicon} from 'react-bootstrap';

class SearchInput extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.doSearch = this.doSearch.bind(this);
        this.doClear = this.doClear.bind(this);
        this.state = {
            value: undefined
        }
    }

    handleChange(event) {
        let value = event.target.value;
        this.setState({value});
        this.props.onChange.call(this, value);
    }

    handleKeyPress(event) {
        if (event.charCode === 13) {
            this.doSearch();
        }
    }

    doSearch() {
        let query = this.state.value;
        this.props.onSearch.call(this, query);
    }

    doClear() {
        this.setState({value: undefined});
        this.input.value = '';
        this.props.onClear();
    }

    render() {
        const placeholder = this.props.placeholder;
        const style = this.props.style;
        return (
            <FormGroup style={style}>
                <InputGroup>
                    <FormControl type="text" placeholder={placeholder} onChange={this.handleChange} onKeyPress={this.handleKeyPress} inputRef={(ref)=>{this.input = ref}} />
                    <InputGroup.Button style={{borderRadius: "0"}}>
                        <Button onClick={this.doSearch} title="Search" style={{borderRadius: "0"}}><Glyphicon glyph="search"/>&#160;</Button>
                    </InputGroup.Button>
                    <InputGroup.Button>
                        <Button onClick={this.doClear} title="Clear"><Glyphicon glyph="remove"/>&#160;</Button>
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>
        )
    }
}

export default SearchInput
