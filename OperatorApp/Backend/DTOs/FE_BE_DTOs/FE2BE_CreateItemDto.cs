using Backend.Models;

namespace Backend.DTOs;

public class FE2BE_CreateItemDto
{
        public string SerialNumber { get; set; }
        public ItemType Type { get; set; }
}
