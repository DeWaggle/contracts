// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

import "./ICoopHiveJobManager.sol";
import "./ICoopHiveJobClient.sol";

contract Client is ICoopHiveJobClient {
    address private jobManagerAddress;
    ICoopHiveJobManager private jobManagerContract;

    mapping(uint256 => string) private jobResults;

    event JobCreated(uint256 id, string message);

    event JobCompleted(uint256 id, string dealId, string dataId);

    constructor(address _jobManagerAddress) {
        setJobManagerAddress(_jobManagerAddress);
    }

    function setJobManagerAddress(
        address _jobManagerAddress
    ) public /*onlyOwner*/ {
        require(_jobManagerAddress != address(0), "Job manager address");
        jobManagerAddress = _jobManagerAddress;
        jobManagerContract = ICoopHiveJobManager(jobManagerAddress);
    }

    function getJobResult(uint256 _jobID) public view returns (string memory) {
        return jobResults[_jobID];
    }

    function runCowsay(string memory message) public {
        string[] memory inputs = new string[](1);
        inputs[0] = string(abi.encodePacked("Message=", message));
        uint256 id = jobManagerContract.runJob(
            "cowsay:v0.0.1",
            inputs,
            msg.sender
        );

        emit JobCreated(id, message);
    }

    function submitResults(
        uint256 id,
        string memory dealId,
        string memory dataId
    ) public override {
        jobResults[id] = dataId;
        emit JobCompleted(id, dealId, dataId);
    }
}
