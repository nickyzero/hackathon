import kind from '@enact/core/kind';
import {Panel, Header} from '@enact/moonstone/Panels';
import React from 'react';

import DatePicker from '@enact/moonstone/DatePicker';
import DaySelector from '@enact/moonstone/DaySelector';
import Input from '@enact/moonstone/Input';
import Scroller from '@enact/moonstone/Scroller';
import Button from '@enact/moonstone/Button';
import BodyText from '@enact/moonstone/BodyText';

import Item from '@enact/moonstone/Item';
import ExpandableList from '@enact/moonstone/ExpandableList';
import VirtualList from '@enact/moonstone/VirtualList';

import css from './MainPanel.less';

class MainPanel extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			idx: 0,
			data: null,
			msg: null,
			rows: []
		};
		this.db = window.openDatabase("schedule", "1.0", "schedule database", 1024*1024);
		this.db.transaction(this.exeCreate);
		this.viewData();
	}

	exeDrop = (tx) => {
		tx.executeSql("drop table schedule");
	}

	exeCreate = (tx) => {
		tx.executeSql("create table schedule(idx, date, msg)");
	}

	insertData = () => {
		this.db.transaction(this.exeInsert);
	}

	exeInsert = (tx) => {
		console.log(this.state.data.value, this.state.msg.value);
		tx.executeSql("insert into schedule values(?, ?, ?)", [this.state.idx++, this.state.data.value, this.state.msg.value]);
	}

	viewData = () => {
		this.db.transaction(this.exeSelect);
	}

	exeSelect = (tx) => {
		tx.executeSql("select * from schedule", [], this.viewTable);
	}

	removeData = ({value}) => () => {
		console.log(value)
		this.db.transaction(this.exeDelete);
	}

	exeDelete = (tx, i) => {
		console.log(i);
		tx.executeSql("delete from schedule where idx == " + i);
		this.setState({
			data: this.state.data.splice(i, 1)
		});
	}

	setData = (v) => {
		this.setState({
			data: v
		});
	}

	setMsg = (v) => {
		this.setState({
			msg: v
		});
	}
	
	formatDate = (date) => {
		var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();
	
		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
	
		return [year, month, day].join('-');
	}

	viewTable = (tx, rs) => {
		console.log("debug");
		this.state.rows = []
		for (let i = 0; i < rs.rows.length; i++) {
			var row = rs.rows.item(i)
			var date = this.formatDate(row.date)
			console.log(date)
			this.setState({
				rows: [...this.state.rows, rs.rows.item(i).msg + " : " + date]
			});
		}
	}

	renderItem = ({index, ...rest}) => (
		<Item {...rest} className={css.item} onClick={this.removeData}>
			{this.state.rows[index]}
		</Item>
	)

	render () {
		return (
			<Panel {...this.props}>
				<Scroller>
					<Header title="Scheduler" />
					<div>
						<DatePicker
								defaultOpen={true}
								onChange={this.setData}
								title="날짜 선택"
								/>
					</div>
					<div>
						<h3>Memo</h3>
						<Input onChange={this.setMsg} placeholder="Enter text here" />
					</div>
					<div>
						<Button onClick={this.insertData}>Add</Button>
						<Button onClick={this.viewData}>View</Button>
					</div>
					<div>
						<VirtualList
							dataSize={this.state.rows.length}
							focusableScrollbar
							itemRenderer={this.renderItem}
							itemSize={62}
						/>
					</div>
				</Scroller>
			</Panel>
		);
	}
}

export default MainPanel;
