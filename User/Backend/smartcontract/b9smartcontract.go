// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package smartcontract

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// SmartcontractMetaData contains all meta data concerning the Smartcontract contract.
var SmartcontractMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"buyLandTitle\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"signer\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"ECDSAInvalidSignature\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"length\",\"type\":\"uint256\"}],\"name\":\"ECDSAInvalidSignatureLength\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"ECDSAInvalidSignatureS\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721IncorrectOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721InsufficientApproval\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"approver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidApprover\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOperator\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"ERC721InvalidOwner\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"receiver\",\"type\":\"address\"}],\"name\":\"ERC721InvalidReceiver\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"ERC721InvalidSender\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ERC721NonexistentToken\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"approved\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"metaFields\",\"type\":\"string\"},{\"internalType\":\"bytes\",\"name\":\"signature\",\"type\":\"bytes\"}],\"name\":\"mintLandTitleNFT\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"nameHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"signature\",\"type\":\"bytes\"}],\"name\":\"registerOwner\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"safeTransferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"buyer\",\"type\":\"address\"},{\"internalType\":\"bytes\",\"name\":\"signature\",\"type\":\"bytes\"}],\"name\":\"setSaleInfo\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getApproved\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getLandMetadata\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"metaFields\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"buyer\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"walletID\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"}],\"name\":\"getLandTitleInfoByWallet\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"}],\"name\":\"getOwnerInfo\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"getOwnershipHistory\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"ownerOf\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"owners\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"wallet\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"nameHash\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"saleInfos\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"buyer\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"tokenURI\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"usedNameHash\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// SmartcontractABI is the input ABI used to generate the binding from.
// Deprecated: Use SmartcontractMetaData.ABI instead.
var SmartcontractABI = SmartcontractMetaData.ABI

// Smartcontract is an auto generated Go binding around an Ethereum contract.
type Smartcontract struct {
	SmartcontractCaller     // Read-only binding to the contract
	SmartcontractTransactor // Write-only binding to the contract
	SmartcontractFilterer   // Log filterer for contract events
}

// SmartcontractCaller is an auto generated read-only Go binding around an Ethereum contract.
type SmartcontractCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SmartcontractTransactor is an auto generated write-only Go binding around an Ethereum contract.
type SmartcontractTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SmartcontractFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type SmartcontractFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// SmartcontractSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type SmartcontractSession struct {
	Contract     *Smartcontract    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// SmartcontractCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type SmartcontractCallerSession struct {
	Contract *SmartcontractCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// SmartcontractTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type SmartcontractTransactorSession struct {
	Contract     *SmartcontractTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// SmartcontractRaw is an auto generated low-level Go binding around an Ethereum contract.
type SmartcontractRaw struct {
	Contract *Smartcontract // Generic contract binding to access the raw methods on
}

// SmartcontractCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type SmartcontractCallerRaw struct {
	Contract *SmartcontractCaller // Generic read-only contract binding to access the raw methods on
}

// SmartcontractTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type SmartcontractTransactorRaw struct {
	Contract *SmartcontractTransactor // Generic write-only contract binding to access the raw methods on
}

// NewSmartcontract creates a new instance of Smartcontract, bound to a specific deployed contract.
func NewSmartcontract(address common.Address, backend bind.ContractBackend) (*Smartcontract, error) {
	contract, err := bindSmartcontract(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Smartcontract{SmartcontractCaller: SmartcontractCaller{contract: contract}, SmartcontractTransactor: SmartcontractTransactor{contract: contract}, SmartcontractFilterer: SmartcontractFilterer{contract: contract}}, nil
}

// NewSmartcontractCaller creates a new read-only instance of Smartcontract, bound to a specific deployed contract.
func NewSmartcontractCaller(address common.Address, caller bind.ContractCaller) (*SmartcontractCaller, error) {
	contract, err := bindSmartcontract(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &SmartcontractCaller{contract: contract}, nil
}

// NewSmartcontractTransactor creates a new write-only instance of Smartcontract, bound to a specific deployed contract.
func NewSmartcontractTransactor(address common.Address, transactor bind.ContractTransactor) (*SmartcontractTransactor, error) {
	contract, err := bindSmartcontract(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &SmartcontractTransactor{contract: contract}, nil
}

// NewSmartcontractFilterer creates a new log filterer instance of Smartcontract, bound to a specific deployed contract.
func NewSmartcontractFilterer(address common.Address, filterer bind.ContractFilterer) (*SmartcontractFilterer, error) {
	contract, err := bindSmartcontract(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &SmartcontractFilterer{contract: contract}, nil
}

// bindSmartcontract binds a generic wrapper to an already deployed contract.
func bindSmartcontract(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := SmartcontractMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Smartcontract *SmartcontractRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Smartcontract.Contract.SmartcontractCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Smartcontract *SmartcontractRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Smartcontract.Contract.SmartcontractTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Smartcontract *SmartcontractRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Smartcontract.Contract.SmartcontractTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Smartcontract *SmartcontractCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Smartcontract.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Smartcontract *SmartcontractTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Smartcontract.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Smartcontract *SmartcontractTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Smartcontract.Contract.contract.Transact(opts, method, params...)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address owner) view returns(uint256)
func (_Smartcontract *SmartcontractCaller) BalanceOf(opts *bind.CallOpts, owner common.Address) (*big.Int, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "balanceOf", owner)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address owner) view returns(uint256)
func (_Smartcontract *SmartcontractSession) BalanceOf(owner common.Address) (*big.Int, error) {
	return _Smartcontract.Contract.BalanceOf(&_Smartcontract.CallOpts, owner)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address owner) view returns(uint256)
func (_Smartcontract *SmartcontractCallerSession) BalanceOf(owner common.Address) (*big.Int, error) {
	return _Smartcontract.Contract.BalanceOf(&_Smartcontract.CallOpts, owner)
}

// GetApproved is a free data retrieval call binding the contract method 0x081812fc.
//
// Solidity: function getApproved(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractCaller) GetApproved(opts *bind.CallOpts, tokenId *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "getApproved", tokenId)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetApproved is a free data retrieval call binding the contract method 0x081812fc.
//
// Solidity: function getApproved(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractSession) GetApproved(tokenId *big.Int) (common.Address, error) {
	return _Smartcontract.Contract.GetApproved(&_Smartcontract.CallOpts, tokenId)
}

// GetApproved is a free data retrieval call binding the contract method 0x081812fc.
//
// Solidity: function getApproved(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractCallerSession) GetApproved(tokenId *big.Int) (common.Address, error) {
	return _Smartcontract.Contract.GetApproved(&_Smartcontract.CallOpts, tokenId)
}

// GetLandMetadata is a free data retrieval call binding the contract method 0x6c2a4ed2.
//
// Solidity: function getLandMetadata(uint256 tokenId) view returns(string metaFields, uint256 price, address buyer, address walletID)
func (_Smartcontract *SmartcontractCaller) GetLandMetadata(opts *bind.CallOpts, tokenId *big.Int) (struct {
	MetaFields string
	Price      *big.Int
	Buyer      common.Address
	WalletID   common.Address
}, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "getLandMetadata", tokenId)

	outstruct := new(struct {
		MetaFields string
		Price      *big.Int
		Buyer      common.Address
		WalletID   common.Address
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.MetaFields = *abi.ConvertType(out[0], new(string)).(*string)
	outstruct.Price = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	outstruct.Buyer = *abi.ConvertType(out[2], new(common.Address)).(*common.Address)
	outstruct.WalletID = *abi.ConvertType(out[3], new(common.Address)).(*common.Address)

	return *outstruct, err

}

// GetLandMetadata is a free data retrieval call binding the contract method 0x6c2a4ed2.
//
// Solidity: function getLandMetadata(uint256 tokenId) view returns(string metaFields, uint256 price, address buyer, address walletID)
func (_Smartcontract *SmartcontractSession) GetLandMetadata(tokenId *big.Int) (struct {
	MetaFields string
	Price      *big.Int
	Buyer      common.Address
	WalletID   common.Address
}, error) {
	return _Smartcontract.Contract.GetLandMetadata(&_Smartcontract.CallOpts, tokenId)
}

// GetLandMetadata is a free data retrieval call binding the contract method 0x6c2a4ed2.
//
// Solidity: function getLandMetadata(uint256 tokenId) view returns(string metaFields, uint256 price, address buyer, address walletID)
func (_Smartcontract *SmartcontractCallerSession) GetLandMetadata(tokenId *big.Int) (struct {
	MetaFields string
	Price      *big.Int
	Buyer      common.Address
	WalletID   common.Address
}, error) {
	return _Smartcontract.Contract.GetLandMetadata(&_Smartcontract.CallOpts, tokenId)
}

// GetLandTitleInfoByWallet is a free data retrieval call binding the contract method 0x49ba16a2.
//
// Solidity: function getLandTitleInfoByWallet(address wallet) view returns(uint256[])
func (_Smartcontract *SmartcontractCaller) GetLandTitleInfoByWallet(opts *bind.CallOpts, wallet common.Address) ([]*big.Int, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "getLandTitleInfoByWallet", wallet)

	if err != nil {
		return *new([]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([]*big.Int)).(*[]*big.Int)

	return out0, err

}

// GetLandTitleInfoByWallet is a free data retrieval call binding the contract method 0x49ba16a2.
//
// Solidity: function getLandTitleInfoByWallet(address wallet) view returns(uint256[])
func (_Smartcontract *SmartcontractSession) GetLandTitleInfoByWallet(wallet common.Address) ([]*big.Int, error) {
	return _Smartcontract.Contract.GetLandTitleInfoByWallet(&_Smartcontract.CallOpts, wallet)
}

// GetLandTitleInfoByWallet is a free data retrieval call binding the contract method 0x49ba16a2.
//
// Solidity: function getLandTitleInfoByWallet(address wallet) view returns(uint256[])
func (_Smartcontract *SmartcontractCallerSession) GetLandTitleInfoByWallet(wallet common.Address) ([]*big.Int, error) {
	return _Smartcontract.Contract.GetLandTitleInfoByWallet(&_Smartcontract.CallOpts, wallet)
}

// GetOwnerInfo is a free data retrieval call binding the contract method 0xd385de82.
//
// Solidity: function getOwnerInfo(address wallet) view returns(bytes32)
func (_Smartcontract *SmartcontractCaller) GetOwnerInfo(opts *bind.CallOpts, wallet common.Address) ([32]byte, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "getOwnerInfo", wallet)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// GetOwnerInfo is a free data retrieval call binding the contract method 0xd385de82.
//
// Solidity: function getOwnerInfo(address wallet) view returns(bytes32)
func (_Smartcontract *SmartcontractSession) GetOwnerInfo(wallet common.Address) ([32]byte, error) {
	return _Smartcontract.Contract.GetOwnerInfo(&_Smartcontract.CallOpts, wallet)
}

// GetOwnerInfo is a free data retrieval call binding the contract method 0xd385de82.
//
// Solidity: function getOwnerInfo(address wallet) view returns(bytes32)
func (_Smartcontract *SmartcontractCallerSession) GetOwnerInfo(wallet common.Address) ([32]byte, error) {
	return _Smartcontract.Contract.GetOwnerInfo(&_Smartcontract.CallOpts, wallet)
}

// GetOwnershipHistory is a free data retrieval call binding the contract method 0xf1dbaccb.
//
// Solidity: function getOwnershipHistory(uint256 tokenId) view returns(address[])
func (_Smartcontract *SmartcontractCaller) GetOwnershipHistory(opts *bind.CallOpts, tokenId *big.Int) ([]common.Address, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "getOwnershipHistory", tokenId)

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetOwnershipHistory is a free data retrieval call binding the contract method 0xf1dbaccb.
//
// Solidity: function getOwnershipHistory(uint256 tokenId) view returns(address[])
func (_Smartcontract *SmartcontractSession) GetOwnershipHistory(tokenId *big.Int) ([]common.Address, error) {
	return _Smartcontract.Contract.GetOwnershipHistory(&_Smartcontract.CallOpts, tokenId)
}

// GetOwnershipHistory is a free data retrieval call binding the contract method 0xf1dbaccb.
//
// Solidity: function getOwnershipHistory(uint256 tokenId) view returns(address[])
func (_Smartcontract *SmartcontractCallerSession) GetOwnershipHistory(tokenId *big.Int) ([]common.Address, error) {
	return _Smartcontract.Contract.GetOwnershipHistory(&_Smartcontract.CallOpts, tokenId)
}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_Smartcontract *SmartcontractCaller) IsApprovedForAll(opts *bind.CallOpts, owner common.Address, operator common.Address) (bool, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "isApprovedForAll", owner, operator)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_Smartcontract *SmartcontractSession) IsApprovedForAll(owner common.Address, operator common.Address) (bool, error) {
	return _Smartcontract.Contract.IsApprovedForAll(&_Smartcontract.CallOpts, owner, operator)
}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_Smartcontract *SmartcontractCallerSession) IsApprovedForAll(owner common.Address, operator common.Address) (bool, error) {
	return _Smartcontract.Contract.IsApprovedForAll(&_Smartcontract.CallOpts, owner, operator)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Smartcontract *SmartcontractCaller) Name(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "name")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Smartcontract *SmartcontractSession) Name() (string, error) {
	return _Smartcontract.Contract.Name(&_Smartcontract.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_Smartcontract *SmartcontractCallerSession) Name() (string, error) {
	return _Smartcontract.Contract.Name(&_Smartcontract.CallOpts)
}

// OwnerOf is a free data retrieval call binding the contract method 0x6352211e.
//
// Solidity: function ownerOf(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractCaller) OwnerOf(opts *bind.CallOpts, tokenId *big.Int) (common.Address, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "ownerOf", tokenId)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// OwnerOf is a free data retrieval call binding the contract method 0x6352211e.
//
// Solidity: function ownerOf(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractSession) OwnerOf(tokenId *big.Int) (common.Address, error) {
	return _Smartcontract.Contract.OwnerOf(&_Smartcontract.CallOpts, tokenId)
}

// OwnerOf is a free data retrieval call binding the contract method 0x6352211e.
//
// Solidity: function ownerOf(uint256 tokenId) view returns(address)
func (_Smartcontract *SmartcontractCallerSession) OwnerOf(tokenId *big.Int) (common.Address, error) {
	return _Smartcontract.Contract.OwnerOf(&_Smartcontract.CallOpts, tokenId)
}

// Owners is a free data retrieval call binding the contract method 0x022914a7.
//
// Solidity: function owners(address ) view returns(address wallet, bytes32 nameHash)
func (_Smartcontract *SmartcontractCaller) Owners(opts *bind.CallOpts, arg0 common.Address) (struct {
	Wallet   common.Address
	NameHash [32]byte
}, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "owners", arg0)

	outstruct := new(struct {
		Wallet   common.Address
		NameHash [32]byte
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Wallet = *abi.ConvertType(out[0], new(common.Address)).(*common.Address)
	outstruct.NameHash = *abi.ConvertType(out[1], new([32]byte)).(*[32]byte)

	return *outstruct, err

}

// Owners is a free data retrieval call binding the contract method 0x022914a7.
//
// Solidity: function owners(address ) view returns(address wallet, bytes32 nameHash)
func (_Smartcontract *SmartcontractSession) Owners(arg0 common.Address) (struct {
	Wallet   common.Address
	NameHash [32]byte
}, error) {
	return _Smartcontract.Contract.Owners(&_Smartcontract.CallOpts, arg0)
}

// Owners is a free data retrieval call binding the contract method 0x022914a7.
//
// Solidity: function owners(address ) view returns(address wallet, bytes32 nameHash)
func (_Smartcontract *SmartcontractCallerSession) Owners(arg0 common.Address) (struct {
	Wallet   common.Address
	NameHash [32]byte
}, error) {
	return _Smartcontract.Contract.Owners(&_Smartcontract.CallOpts, arg0)
}

// SaleInfos is a free data retrieval call binding the contract method 0x9b36c56c.
//
// Solidity: function saleInfos(uint256 ) view returns(uint256 price, address buyer)
func (_Smartcontract *SmartcontractCaller) SaleInfos(opts *bind.CallOpts, arg0 *big.Int) (struct {
	Price *big.Int
	Buyer common.Address
}, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "saleInfos", arg0)

	outstruct := new(struct {
		Price *big.Int
		Buyer common.Address
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Price = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.Buyer = *abi.ConvertType(out[1], new(common.Address)).(*common.Address)

	return *outstruct, err

}

// SaleInfos is a free data retrieval call binding the contract method 0x9b36c56c.
//
// Solidity: function saleInfos(uint256 ) view returns(uint256 price, address buyer)
func (_Smartcontract *SmartcontractSession) SaleInfos(arg0 *big.Int) (struct {
	Price *big.Int
	Buyer common.Address
}, error) {
	return _Smartcontract.Contract.SaleInfos(&_Smartcontract.CallOpts, arg0)
}

// SaleInfos is a free data retrieval call binding the contract method 0x9b36c56c.
//
// Solidity: function saleInfos(uint256 ) view returns(uint256 price, address buyer)
func (_Smartcontract *SmartcontractCallerSession) SaleInfos(arg0 *big.Int) (struct {
	Price *big.Int
	Buyer common.Address
}, error) {
	return _Smartcontract.Contract.SaleInfos(&_Smartcontract.CallOpts, arg0)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_Smartcontract *SmartcontractCaller) SupportsInterface(opts *bind.CallOpts, interfaceId [4]byte) (bool, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "supportsInterface", interfaceId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_Smartcontract *SmartcontractSession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _Smartcontract.Contract.SupportsInterface(&_Smartcontract.CallOpts, interfaceId)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_Smartcontract *SmartcontractCallerSession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _Smartcontract.Contract.SupportsInterface(&_Smartcontract.CallOpts, interfaceId)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Smartcontract *SmartcontractCaller) Symbol(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "symbol")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Smartcontract *SmartcontractSession) Symbol() (string, error) {
	return _Smartcontract.Contract.Symbol(&_Smartcontract.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_Smartcontract *SmartcontractCallerSession) Symbol() (string, error) {
	return _Smartcontract.Contract.Symbol(&_Smartcontract.CallOpts)
}

// TokenURI is a free data retrieval call binding the contract method 0xc87b56dd.
//
// Solidity: function tokenURI(uint256 tokenId) view returns(string)
func (_Smartcontract *SmartcontractCaller) TokenURI(opts *bind.CallOpts, tokenId *big.Int) (string, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "tokenURI", tokenId)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// TokenURI is a free data retrieval call binding the contract method 0xc87b56dd.
//
// Solidity: function tokenURI(uint256 tokenId) view returns(string)
func (_Smartcontract *SmartcontractSession) TokenURI(tokenId *big.Int) (string, error) {
	return _Smartcontract.Contract.TokenURI(&_Smartcontract.CallOpts, tokenId)
}

// TokenURI is a free data retrieval call binding the contract method 0xc87b56dd.
//
// Solidity: function tokenURI(uint256 tokenId) view returns(string)
func (_Smartcontract *SmartcontractCallerSession) TokenURI(tokenId *big.Int) (string, error) {
	return _Smartcontract.Contract.TokenURI(&_Smartcontract.CallOpts, tokenId)
}

// UsedNameHash is a free data retrieval call binding the contract method 0xbf21ea98.
//
// Solidity: function usedNameHash(bytes32 ) view returns(bool)
func (_Smartcontract *SmartcontractCaller) UsedNameHash(opts *bind.CallOpts, arg0 [32]byte) (bool, error) {
	var out []interface{}
	err := _Smartcontract.contract.Call(opts, &out, "usedNameHash", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// UsedNameHash is a free data retrieval call binding the contract method 0xbf21ea98.
//
// Solidity: function usedNameHash(bytes32 ) view returns(bool)
func (_Smartcontract *SmartcontractSession) UsedNameHash(arg0 [32]byte) (bool, error) {
	return _Smartcontract.Contract.UsedNameHash(&_Smartcontract.CallOpts, arg0)
}

// UsedNameHash is a free data retrieval call binding the contract method 0xbf21ea98.
//
// Solidity: function usedNameHash(bytes32 ) view returns(bool)
func (_Smartcontract *SmartcontractCallerSession) UsedNameHash(arg0 [32]byte) (bool, error) {
	return _Smartcontract.Contract.UsedNameHash(&_Smartcontract.CallOpts, arg0)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactor) Approve(opts *bind.TransactOpts, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "approve", to, tokenId)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractSession) Approve(to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.Approve(&_Smartcontract.TransactOpts, to, tokenId)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactorSession) Approve(to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.Approve(&_Smartcontract.TransactOpts, to, tokenId)
}

// BuyLandTitle is a paid mutator transaction binding the contract method 0xc8049e82.
//
// Solidity: function buyLandTitle(uint256 tokenId) payable returns()
func (_Smartcontract *SmartcontractTransactor) BuyLandTitle(opts *bind.TransactOpts, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "buyLandTitle", tokenId)
}

// BuyLandTitle is a paid mutator transaction binding the contract method 0xc8049e82.
//
// Solidity: function buyLandTitle(uint256 tokenId) payable returns()
func (_Smartcontract *SmartcontractSession) BuyLandTitle(tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.BuyLandTitle(&_Smartcontract.TransactOpts, tokenId)
}

// BuyLandTitle is a paid mutator transaction binding the contract method 0xc8049e82.
//
// Solidity: function buyLandTitle(uint256 tokenId) payable returns()
func (_Smartcontract *SmartcontractTransactorSession) BuyLandTitle(tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.BuyLandTitle(&_Smartcontract.TransactOpts, tokenId)
}

// MintLandTitleNFT is a paid mutator transaction binding the contract method 0x1f4fec36.
//
// Solidity: function mintLandTitleNFT(address wallet, string metaFields, bytes signature) returns(uint256)
func (_Smartcontract *SmartcontractTransactor) MintLandTitleNFT(opts *bind.TransactOpts, wallet common.Address, metaFields string, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "mintLandTitleNFT", wallet, metaFields, signature)
}

// MintLandTitleNFT is a paid mutator transaction binding the contract method 0x1f4fec36.
//
// Solidity: function mintLandTitleNFT(address wallet, string metaFields, bytes signature) returns(uint256)
func (_Smartcontract *SmartcontractSession) MintLandTitleNFT(wallet common.Address, metaFields string, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.MintLandTitleNFT(&_Smartcontract.TransactOpts, wallet, metaFields, signature)
}

// MintLandTitleNFT is a paid mutator transaction binding the contract method 0x1f4fec36.
//
// Solidity: function mintLandTitleNFT(address wallet, string metaFields, bytes signature) returns(uint256)
func (_Smartcontract *SmartcontractTransactorSession) MintLandTitleNFT(wallet common.Address, metaFields string, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.MintLandTitleNFT(&_Smartcontract.TransactOpts, wallet, metaFields, signature)
}

// RegisterOwner is a paid mutator transaction binding the contract method 0x694ac98d.
//
// Solidity: function registerOwner(address wallet, bytes32 nameHash, bytes signature) returns()
func (_Smartcontract *SmartcontractTransactor) RegisterOwner(opts *bind.TransactOpts, wallet common.Address, nameHash [32]byte, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "registerOwner", wallet, nameHash, signature)
}

// RegisterOwner is a paid mutator transaction binding the contract method 0x694ac98d.
//
// Solidity: function registerOwner(address wallet, bytes32 nameHash, bytes signature) returns()
func (_Smartcontract *SmartcontractSession) RegisterOwner(wallet common.Address, nameHash [32]byte, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.RegisterOwner(&_Smartcontract.TransactOpts, wallet, nameHash, signature)
}

// RegisterOwner is a paid mutator transaction binding the contract method 0x694ac98d.
//
// Solidity: function registerOwner(address wallet, bytes32 nameHash, bytes signature) returns()
func (_Smartcontract *SmartcontractTransactorSession) RegisterOwner(wallet common.Address, nameHash [32]byte, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.RegisterOwner(&_Smartcontract.TransactOpts, wallet, nameHash, signature)
}

// SafeTransferFrom is a paid mutator transaction binding the contract method 0x42842e0e.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactor) SafeTransferFrom(opts *bind.TransactOpts, from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "safeTransferFrom", from, to, tokenId)
}

// SafeTransferFrom is a paid mutator transaction binding the contract method 0x42842e0e.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractSession) SafeTransferFrom(from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.SafeTransferFrom(&_Smartcontract.TransactOpts, from, to, tokenId)
}

// SafeTransferFrom is a paid mutator transaction binding the contract method 0x42842e0e.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactorSession) SafeTransferFrom(from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.SafeTransferFrom(&_Smartcontract.TransactOpts, from, to, tokenId)
}

// SafeTransferFrom0 is a paid mutator transaction binding the contract method 0xb88d4fde.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) returns()
func (_Smartcontract *SmartcontractTransactor) SafeTransferFrom0(opts *bind.TransactOpts, from common.Address, to common.Address, tokenId *big.Int, data []byte) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "safeTransferFrom0", from, to, tokenId, data)
}

// SafeTransferFrom0 is a paid mutator transaction binding the contract method 0xb88d4fde.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) returns()
func (_Smartcontract *SmartcontractSession) SafeTransferFrom0(from common.Address, to common.Address, tokenId *big.Int, data []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.SafeTransferFrom0(&_Smartcontract.TransactOpts, from, to, tokenId, data)
}

// SafeTransferFrom0 is a paid mutator transaction binding the contract method 0xb88d4fde.
//
// Solidity: function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) returns()
func (_Smartcontract *SmartcontractTransactorSession) SafeTransferFrom0(from common.Address, to common.Address, tokenId *big.Int, data []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.SafeTransferFrom0(&_Smartcontract.TransactOpts, from, to, tokenId, data)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_Smartcontract *SmartcontractTransactor) SetApprovalForAll(opts *bind.TransactOpts, operator common.Address, approved bool) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "setApprovalForAll", operator, approved)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_Smartcontract *SmartcontractSession) SetApprovalForAll(operator common.Address, approved bool) (*types.Transaction, error) {
	return _Smartcontract.Contract.SetApprovalForAll(&_Smartcontract.TransactOpts, operator, approved)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_Smartcontract *SmartcontractTransactorSession) SetApprovalForAll(operator common.Address, approved bool) (*types.Transaction, error) {
	return _Smartcontract.Contract.SetApprovalForAll(&_Smartcontract.TransactOpts, operator, approved)
}

// SetSaleInfo is a paid mutator transaction binding the contract method 0x49f3bb12.
//
// Solidity: function setSaleInfo(uint256 tokenId, uint256 price, address buyer, bytes signature) returns()
func (_Smartcontract *SmartcontractTransactor) SetSaleInfo(opts *bind.TransactOpts, tokenId *big.Int, price *big.Int, buyer common.Address, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "setSaleInfo", tokenId, price, buyer, signature)
}

// SetSaleInfo is a paid mutator transaction binding the contract method 0x49f3bb12.
//
// Solidity: function setSaleInfo(uint256 tokenId, uint256 price, address buyer, bytes signature) returns()
func (_Smartcontract *SmartcontractSession) SetSaleInfo(tokenId *big.Int, price *big.Int, buyer common.Address, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.SetSaleInfo(&_Smartcontract.TransactOpts, tokenId, price, buyer, signature)
}

// SetSaleInfo is a paid mutator transaction binding the contract method 0x49f3bb12.
//
// Solidity: function setSaleInfo(uint256 tokenId, uint256 price, address buyer, bytes signature) returns()
func (_Smartcontract *SmartcontractTransactorSession) SetSaleInfo(tokenId *big.Int, price *big.Int, buyer common.Address, signature []byte) (*types.Transaction, error) {
	return _Smartcontract.Contract.SetSaleInfo(&_Smartcontract.TransactOpts, tokenId, price, buyer, signature)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactor) TransferFrom(opts *bind.TransactOpts, from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.contract.Transact(opts, "transferFrom", from, to, tokenId)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractSession) TransferFrom(from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.TransferFrom(&_Smartcontract.TransactOpts, from, to, tokenId)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address from, address to, uint256 tokenId) returns()
func (_Smartcontract *SmartcontractTransactorSession) TransferFrom(from common.Address, to common.Address, tokenId *big.Int) (*types.Transaction, error) {
	return _Smartcontract.Contract.TransferFrom(&_Smartcontract.TransactOpts, from, to, tokenId)
}

// SmartcontractApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the Smartcontract contract.
type SmartcontractApprovalIterator struct {
	Event *SmartcontractApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SmartcontractApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SmartcontractApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SmartcontractApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SmartcontractApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SmartcontractApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SmartcontractApproval represents a Approval event raised by the Smartcontract contract.
type SmartcontractApproval struct {
	Owner    common.Address
	Approved common.Address
	TokenId  *big.Int
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
func (_Smartcontract *SmartcontractFilterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, approved []common.Address, tokenId []*big.Int) (*SmartcontractApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var approvedRule []interface{}
	for _, approvedItem := range approved {
		approvedRule = append(approvedRule, approvedItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _Smartcontract.contract.FilterLogs(opts, "Approval", ownerRule, approvedRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return &SmartcontractApprovalIterator{contract: _Smartcontract.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
func (_Smartcontract *SmartcontractFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *SmartcontractApproval, owner []common.Address, approved []common.Address, tokenId []*big.Int) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var approvedRule []interface{}
	for _, approvedItem := range approved {
		approvedRule = append(approvedRule, approvedItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _Smartcontract.contract.WatchLogs(opts, "Approval", ownerRule, approvedRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SmartcontractApproval)
				if err := _Smartcontract.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApproval is a log parse operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
func (_Smartcontract *SmartcontractFilterer) ParseApproval(log types.Log) (*SmartcontractApproval, error) {
	event := new(SmartcontractApproval)
	if err := _Smartcontract.contract.UnpackLog(event, "Approval", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SmartcontractApprovalForAllIterator is returned from FilterApprovalForAll and is used to iterate over the raw logs and unpacked data for ApprovalForAll events raised by the Smartcontract contract.
type SmartcontractApprovalForAllIterator struct {
	Event *SmartcontractApprovalForAll // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SmartcontractApprovalForAllIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SmartcontractApprovalForAll)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SmartcontractApprovalForAll)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SmartcontractApprovalForAllIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SmartcontractApprovalForAllIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SmartcontractApprovalForAll represents a ApprovalForAll event raised by the Smartcontract contract.
type SmartcontractApprovalForAll struct {
	Owner    common.Address
	Operator common.Address
	Approved bool
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterApprovalForAll is a free log retrieval operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_Smartcontract *SmartcontractFilterer) FilterApprovalForAll(opts *bind.FilterOpts, owner []common.Address, operator []common.Address) (*SmartcontractApprovalForAllIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}

	logs, sub, err := _Smartcontract.contract.FilterLogs(opts, "ApprovalForAll", ownerRule, operatorRule)
	if err != nil {
		return nil, err
	}
	return &SmartcontractApprovalForAllIterator{contract: _Smartcontract.contract, event: "ApprovalForAll", logs: logs, sub: sub}, nil
}

// WatchApprovalForAll is a free log subscription operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_Smartcontract *SmartcontractFilterer) WatchApprovalForAll(opts *bind.WatchOpts, sink chan<- *SmartcontractApprovalForAll, owner []common.Address, operator []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}

	logs, sub, err := _Smartcontract.contract.WatchLogs(opts, "ApprovalForAll", ownerRule, operatorRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SmartcontractApprovalForAll)
				if err := _Smartcontract.contract.UnpackLog(event, "ApprovalForAll", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApprovalForAll is a log parse operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_Smartcontract *SmartcontractFilterer) ParseApprovalForAll(log types.Log) (*SmartcontractApprovalForAll, error) {
	event := new(SmartcontractApprovalForAll)
	if err := _Smartcontract.contract.UnpackLog(event, "ApprovalForAll", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// SmartcontractTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the Smartcontract contract.
type SmartcontractTransferIterator struct {
	Event *SmartcontractTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *SmartcontractTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(SmartcontractTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(SmartcontractTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *SmartcontractTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *SmartcontractTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// SmartcontractTransfer represents a Transfer event raised by the Smartcontract contract.
type SmartcontractTransfer struct {
	From    common.Address
	To      common.Address
	TokenId *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
func (_Smartcontract *SmartcontractFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address, tokenId []*big.Int) (*SmartcontractTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _Smartcontract.contract.FilterLogs(opts, "Transfer", fromRule, toRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return &SmartcontractTransferIterator{contract: _Smartcontract.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
func (_Smartcontract *SmartcontractFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *SmartcontractTransfer, from []common.Address, to []common.Address, tokenId []*big.Int) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _Smartcontract.contract.WatchLogs(opts, "Transfer", fromRule, toRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(SmartcontractTransfer)
				if err := _Smartcontract.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

