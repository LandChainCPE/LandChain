// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;

contract LandRegistry {
    struct LandRecord {
        string ravang;
        string landNumber;
        string surveyPage;
        string subDistrict;
        string number;
        string volume;
        string page;
        string district;
        string province;
        address registrant;
        uint256 timestamp;
    }

    LandRecord[] public records;

    event LandRegistered(address indexed registrant, uint256 timestamp);

    // ฟังก์ชันบันทึกข้อมูลโฉนดที่ดิน
    function registerLand(
        string memory ravang,
        string memory landNumber,
        string memory surveyPage,
        string memory subDistrict,
        string memory number,
        string memory volume,
        string memory page,
        string memory district,
        string memory province
    ) public {
        LandRecord memory newRecord = LandRecord({
            ravang: ravang,
            landNumber: landNumber,
            surveyPage: surveyPage,
            subDistrict: subDistrict,
            number: number,
            volume: volume,
            page: page,
            district: district,
            province: province,
            registrant: msg.sender,
            timestamp: block.timestamp
        });

        records.push(newRecord);
        emit LandRegistered(msg.sender, block.timestamp);
    }

    // ฟังก์ชันดึงจำนวนรายการทั้งหมด
    function getTotalRecords() public view returns (uint256) {
        return records.length;
    }

    // ฟังก์ชันดึงข้อมูลโฉนดที่ดินตามดัชนี
    function getRecord(uint256 index) public view returns (
        string memory, string memory, string memory, string memory,
        string memory, string memory, string memory, string memory,
        string memory, address, uint256
    ) {
        require(index < records.length, "Invalid index");
        LandRecord memory record = records[index];
        return (
            record.ravang,
            record.landNumber,
            record.surveyPage,
            record.subDistrict,
            record.number,
            record.volume,
            record.page,
            record.district,
            record.province,
            record.registrant,
            record.timestamp
        );
    }
}
